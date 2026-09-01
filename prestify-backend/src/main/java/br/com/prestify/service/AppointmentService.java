package br.com.prestify.service;

import br.com.prestify.dto.appointment.AppointmentCreateRequest;
import br.com.prestify.dto.appointment.AppointmentResponse;
import br.com.prestify.dto.appointment.AppointmentUpdateRequest;

import br.com.prestify.entity.Appointment;
import br.com.prestify.entity.BusinessService;
import br.com.prestify.entity.Client;
import br.com.prestify.entity.User;

import br.com.prestify.enums.AppointmentStatus;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.AppointmentRepository;
import br.com.prestify.repository.BusinessServiceRepository;
import br.com.prestify.repository.ClientRepository;
import br.com.prestify.repository.UserRepository;

import br.com.prestify.security.CurrentUserService;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {

    private final AppointmentRepository
        appointmentRepository;

    private final ClientRepository
        clientRepository;

    private final BusinessServiceRepository
        serviceRepository;

    private final UserRepository
        userRepository;

    private final CurrentUserService
        currentUserService;

    private final FinancialService
        financialService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            ClientRepository clientRepository,
            BusinessServiceRepository serviceRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService,
            FinancialService financialService
    ) {

        this.appointmentRepository =
            appointmentRepository;

        this.clientRepository =
            clientRepository;

        this.serviceRepository =
            serviceRepository;

        this.userRepository =
            userRepository;

        this.currentUserService =
            currentUserService;

        this.financialService =
            financialService;
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> list(
            LocalDateTime start,
            LocalDateTime end,
            Long professionalId,
            AppointmentStatus status,
            int page,
            int size
    ) {

        validatePagination(
            page,
            size
        );

        if (
            start == null
            || end == null
        ) {

            throw new BusinessException(
                "Informe o período inicial e final da agenda."
            );
        }

        if (
            !start.isBefore(
                end
            )
        ) {

            throw new BusinessException(
                "O início do período deve ser anterior ao fim."
            );
        }

        Long organizationId =
            currentUserService
                .getOrganizationId();

        if (
            professionalId != null
        ) {

            findProfessional(
                professionalId,
                organizationId
            );
        }

        Page<Appointment>
            appointments =
                appointmentRepository
                    .findAgenda(
                        organizationId,
                        start,
                        end,
                        professionalId,
                        status,
                        PageRequest.of(
                            page,
                            size,
                            Sort.by(
                                Sort.Direction.ASC,
                                "startTime"
                            )
                        )
                    );

        return appointments.map(
            this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(
            Long id
    ) {

        return toResponse(
            findAppointment(
                id
            )
        );
    }

    @Transactional
    public AppointmentResponse create(
            AppointmentCreateRequest request
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        Client client =
            findClient(
                request.getClientId(),
                organizationId
            );

        BusinessService service =
            findBusinessService(
                request.getServiceId(),
                organizationId
            );

        User professional =
            findProfessional(
                request.getProfessionalId(),
                organizationId
            );

        validateActiveEntities(
            client,
            service,
            professional
        );

        LocalDateTime startTime =
            request.getStartTime();

        if (
            startTime.isBefore(
                LocalDateTime.now()
            )
        ) {

            throw new BusinessException(
                "O agendamento não pode ser criado no passado."
            );
        }

        LocalDateTime endTime =
            startTime.plusMinutes(
                service
                    .getDurationMinutes()
            );

        validateConflict(
            organizationId,
            professional.getId(),
            startTime,
            endTime,
            null
        );

        Appointment appointment =
            new Appointment();

        appointment.setClient(
            client
        );

        appointment.setService(
            service
        );

        appointment.setProfessional(
            professional
        );

        appointment.setStartTime(
            startTime
        );

        appointment.setEndTime(
            endTime
        );

        /*
         * Snapshot do preço e da
         * duração do serviço.
         */
        appointment.setPrice(
            service.getPrice()
        );

        appointment.setDurationMinutes(
            service
                .getDurationMinutes()
        );

        appointment.setStatus(
            AppointmentStatus.SCHEDULED
        );

        appointment.setNotes(
            normalizeNullable(
                request.getNotes()
            )
        );

        appointment.setOrganization(
            currentUserService
                .getCurrentUser()
                .getOrganization()
        );

        return toResponse(
            appointmentRepository.save(
                appointment
            )
        );
    }

    @Transactional
    public AppointmentResponse update(
            Long id,
            AppointmentUpdateRequest request
    ) {

        Appointment appointment =
            findAppointment(
                id
            );

        if (
            appointment.getStatus()
                == AppointmentStatus.COMPLETED
        ) {

            throw new BusinessException(
                "Um agendamento concluído não pode ser alterado."
            );
        }

        if (
            appointment.getStatus()
                == AppointmentStatus.CANCELLED
        ) {

            throw new BusinessException(
                "Um agendamento cancelado não pode ser alterado."
            );
        }

        Long organizationId =
            currentUserService
                .getOrganizationId();

        Client client =
            findClient(
                request.getClientId(),
                organizationId
            );

        BusinessService service =
            findBusinessService(
                request.getServiceId(),
                organizationId
            );

        User professional =
            findProfessional(
                request
                    .getProfessionalId(),
                organizationId
            );

        validateActiveEntities(
            client,
            service,
            professional
        );

        LocalDateTime startTime =
            request.getStartTime();

        if (
            startTime.isBefore(
                LocalDateTime.now()
            )
        ) {

            throw new BusinessException(
                "O agendamento não pode ser movido para o passado."
            );
        }

        LocalDateTime endTime =
            startTime.plusMinutes(
                service
                    .getDurationMinutes()
            );

        validateConflict(
            organizationId,
            professional.getId(),
            startTime,
            endTime,
            appointment.getId()
        );

        appointment.setClient(
            client
        );

        appointment.setService(
            service
        );

        appointment.setProfessional(
            professional
        );

        appointment.setStartTime(
            startTime
        );

        appointment.setEndTime(
            endTime
        );

        appointment.setPrice(
            service.getPrice()
        );

        appointment.setDurationMinutes(
            service
                .getDurationMinutes()
        );

        appointment.setNotes(
            normalizeNullable(
                request.getNotes()
            )
        );

        return toResponse(
            appointmentRepository.save(
                appointment
            )
        );
    }

    @Transactional
    public AppointmentResponse changeStatus(
            Long id,
            AppointmentStatus newStatus
    ) {

        Appointment appointment =
            findAppointment(
                id
            );

        AppointmentStatus currentStatus =
            appointment.getStatus();

        if (
            currentStatus == newStatus
        ) {

            return toResponse(
                appointment
            );
        }

        validateStatusTransition(
            currentStatus,
            newStatus
        );

        appointment.setStatus(
            newStatus
        );

        appointment =
            appointmentRepository.save(
                appointment
            );

        /*
         * Quando o atendimento é
         * concluído, cria uma receita
         * automática no financeiro.
         */
        if (
            newStatus
                == AppointmentStatus.COMPLETED
        ) {

            financialService
                .createAppointmentIncome(
                    appointment
                );
        }

        return toResponse(
            appointment
        );
    }

    @Transactional
    public void delete(
            Long id
    ) {

        Appointment appointment =
            findAppointment(
                id
            );

        if (
            appointment.getStatus()
                == AppointmentStatus.COMPLETED
        ) {

            throw new BusinessException(
                "Um agendamento concluído não pode ser excluído."
            );
        }

        appointment.setStatus(
            AppointmentStatus.CANCELLED
        );

        appointmentRepository.save(
            appointment
        );
    }

    private Appointment findAppointment(
            Long id
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        return appointmentRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Agendamento não encontrado."
                    )
            );
    }

    private Client findClient(
            Long id,
            Long organizationId
    ) {

        return clientRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Cliente não encontrado."
                    )
            );
    }

    private BusinessService
        findBusinessService(
            Long id,
            Long organizationId
    ) {

        return serviceRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Serviço não encontrado."
                    )
            );
    }

    private User findProfessional(
            Long id,
            Long organizationId
    ) {

        return userRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Profissional não encontrado."
                    )
            );
    }

    private void validateActiveEntities(
            Client client,
            BusinessService service,
            User professional
    ) {

        if (
            !Boolean.TRUE.equals(
                client.getActive()
            )
        ) {

            throw new BusinessException(
                "Não é possível agendar para um cliente inativo."
            );
        }

        if (
            !Boolean.TRUE.equals(
                service.getActive()
            )
        ) {

            throw new BusinessException(
                "Não é possível utilizar um serviço inativo."
            );
        }

        if (
            !Boolean.TRUE.equals(
                professional.getActive()
            )
        ) {

            throw new BusinessException(
                "Não é possível agendar para um profissional inativo."
            );
        }
    }

    private void validateConflict(
            Long organizationId,
            Long professionalId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long ignoredAppointmentId
    ) {

        long conflicts =
            appointmentRepository
                .countConflicts(
                    organizationId,
                    professionalId,
                    startTime,
                    endTime,
                    ignoredAppointmentId
                );

        if (
            conflicts > 0
        ) {

            throw new BusinessException(
                "O profissional já possui um agendamento neste horário."
            );
        }
    }

    private void validateStatusTransition(
            AppointmentStatus current,
            AppointmentStatus next
    ) {

        boolean valid =
            switch (current) {

                case SCHEDULED ->
                    next
                        == AppointmentStatus.CONFIRMED
                    || next
                        == AppointmentStatus.CANCELLED
                    || next
                        == AppointmentStatus.NO_SHOW;

                case CONFIRMED ->
                    next
                        == AppointmentStatus.IN_PROGRESS
                    || next
                        == AppointmentStatus.CANCELLED
                    || next
                        == AppointmentStatus.NO_SHOW;

                case IN_PROGRESS ->
                    next
                        == AppointmentStatus.COMPLETED
                    || next
                        == AppointmentStatus.CANCELLED;

                case COMPLETED,
                     CANCELLED,
                     NO_SHOW ->
                    false;
            };

        if (
            !valid
        ) {

            throw new BusinessException(
                "Transição de status inválida: "
                + current
                + " -> "
                + next
                + "."
            );
        }
    }

    private String normalizeNullable(
            String value
    ) {

        if (
            value == null
            || value.isBlank()
        ) {

            return null;
        }

        return value.trim();
    }

    private void validatePagination(
            int page,
            int size
    ) {

        if (
            page < 0
        ) {

            throw new BusinessException(
                "A página não pode ser negativa."
            );
        }

        if (
            size < 1
            || size > 100
        ) {

            throw new BusinessException(
                "O tamanho da página deve estar entre 1 e 100."
            );
        }
    }

    private AppointmentResponse toResponse(
            Appointment appointment
    ) {

        return new AppointmentResponse(
            appointment.getId(),

            appointment
                .getClient()
                .getId(),

            appointment
                .getClient()
                .getName(),

            appointment
                .getService()
                .getId(),

            appointment
                .getService()
                .getName(),

            appointment
                .getProfessional()
                .getId(),

            appointment
                .getProfessional()
                .getName(),

            appointment.getStartTime(),
            appointment.getEndTime(),

            appointment
                .getDurationMinutes(),

            appointment.getPrice(),

            appointment
                .getStatus()
                .name(),

            appointment.getNotes(),

            appointment.getCreatedAt(),
            appointment.getUpdatedAt()
        );
    }
}