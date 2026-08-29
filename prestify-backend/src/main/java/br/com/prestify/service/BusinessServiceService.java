package br.com.prestify.service;

import br.com.prestify.dto.service.ServiceCreateRequest;
import br.com.prestify.dto.service.ServiceResponse;
import br.com.prestify.dto.service.ServiceUpdateRequest;

import br.com.prestify.entity.BusinessService;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.BusinessServiceRepository;

import br.com.prestify.security.CurrentUserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;

@Service
public class BusinessServiceService {

    private final BusinessServiceRepository serviceRepository;
    private final CurrentUserService currentUserService;

    public BusinessServiceService(
            BusinessServiceRepository serviceRepository,
            CurrentUserService currentUserService
    ) {
        this.serviceRepository = serviceRepository;
        this.currentUserService = currentUserService;
    }

    public Page<ServiceResponse> list(
            String search,
            Boolean active,
            int page,
            int size
    ) {

        validatePagination(page, size);

        Long organizationId =
            currentUserService.getOrganizationId();

        String term =
            search == null
                ? ""
                : search.trim();

        Page<BusinessService> services =
            serviceRepository.search(
                organizationId,
                term,
                active,
                PageRequest.of(
                    page,
                    size,
                    Sort.by(
                        Sort.Direction.ASC,
                        "name"
                    )
                )
            );

        return services.map(
            this::toResponse
        );
    }

    public ServiceResponse getById(
            Long id
    ) {

        return toResponse(
            findService(id)
        );
    }

    public ServiceResponse create(
            ServiceCreateRequest request
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        String name =
            request.getName().trim();

        if (
            serviceRepository
                .existsByNameIgnoreCaseAndOrganizationId(
                    name,
                    organizationId
                )
        ) {

            throw new BusinessException(
                "Já existe um serviço com este nome."
            );
        }

        BusinessService service =
            new BusinessService();

        service.setName(name);

        service.setDescription(
            normalizeNullable(
                request.getDescription()
            )
        );

        service.setPrice(
            request.getPrice()
        );

        service.setDurationMinutes(
            request.getDurationMinutes()
        );

        service.setActive(true);

        service.setOrganization(
            currentUserService
                .getCurrentUser()
                .getOrganization()
        );

        return toResponse(
            serviceRepository.save(service)
        );
    }

    public ServiceResponse update(
            Long id,
            ServiceUpdateRequest request
    ) {

        BusinessService service =
            findService(id);

        Long organizationId =
            currentUserService.getOrganizationId();

        String name =
            request.getName().trim();

        if (
            serviceRepository
                .existsByNameIgnoreCaseAndOrganizationIdAndIdNot(
                    name,
                    organizationId,
                    service.getId()
                )
        ) {

            throw new BusinessException(
                "Já existe um serviço com este nome."
            );
        }

        service.setName(name);

        service.setDescription(
            normalizeNullable(
                request.getDescription()
            )
        );

        service.setPrice(
            request.getPrice()
        );

        service.setDurationMinutes(
            request.getDurationMinutes()
        );

        return toResponse(
            serviceRepository.save(service)
        );
    }

    public ServiceResponse changeStatus(
            Long id,
            Boolean active
    ) {

        BusinessService service =
            findService(id);

        service.setActive(active);

        return toResponse(
            serviceRepository.save(service)
        );
    }

    public void delete(
            Long id
    ) {

        BusinessService service =
            findService(id);

        /*
         * Exclusão lógica.
         *
         * Serviços utilizados em agendamentos
         * futuros ou históricos não devem
         * desaparecer fisicamente do banco.
         */
        service.setActive(false);

        serviceRepository.save(service);
    }

    private BusinessService findService(
            Long id
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

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

        if (page < 0) {
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

    private ServiceResponse toResponse(
            BusinessService service
    ) {

        return new ServiceResponse(
            service.getId(),
            service.getName(),
            service.getDescription(),
            service.getPrice(),
            service.getDurationMinutes(),
            service.getActive(),
            service.getCreatedAt(),
            service.getUpdatedAt()
        );
    }
}