package br.com.prestify.repository;

import br.com.prestify.entity.Appointment;
import br.com.prestify.enums.AppointmentStatus;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    Optional<Appointment>
        findByIdAndOrganizationId(
            Long id,
            Long organizationId
        );

    @Query("""
        SELECT a
        FROM Appointment a
        WHERE a.organization.id = :organizationId
        AND a.startTime >= :start
        AND a.startTime < :end
        AND (
            :professionalId IS NULL
            OR a.professional.id = :professionalId
        )
        AND (
            :status IS NULL
            OR a.status = :status
        )
        """)
    Page<Appointment> findAgenda(
        @Param("organizationId")
        Long organizationId,

        @Param("start")
        LocalDateTime start,

        @Param("end")
        LocalDateTime end,

        @Param("professionalId")
        Long professionalId,

        @Param("status")
        AppointmentStatus status,

        Pageable pageable
    );

    @Query("""
        SELECT COUNT(a)
        FROM Appointment a
        WHERE a.organization.id = :organizationId
        AND a.professional.id = :professionalId
        AND a.status NOT IN (
            br.com.prestify.enums.AppointmentStatus.CANCELLED,
            br.com.prestify.enums.AppointmentStatus.NO_SHOW
        )
        AND a.startTime < :endTime
        AND a.endTime > :startTime
        AND (
            :ignoredAppointmentId IS NULL
            OR a.id <> :ignoredAppointmentId
        )
        """)
    long countConflicts(
        @Param("organizationId")
        Long organizationId,

        @Param("professionalId")
        Long professionalId,

        @Param("startTime")
        LocalDateTime startTime,

        @Param("endTime")
        LocalDateTime endTime,

        @Param("ignoredAppointmentId")
        Long ignoredAppointmentId
    );

    @Query("""
        SELECT COUNT(a)
        FROM Appointment a
        WHERE a.organization.id = :organizationId
        AND a.startTime >= :start
        AND a.startTime < :end
        AND a.status NOT IN (
            br.com.prestify.enums.AppointmentStatus.CANCELLED,
            br.com.prestify.enums.AppointmentStatus.NO_SHOW
        )
        """)
    long countAppointmentsInPeriod(
        @Param("organizationId")
        Long organizationId,

        @Param("start")
        LocalDateTime start,

        @Param("end")
        LocalDateTime end
    );

    @Query("""
        SELECT COUNT(a)
        FROM Appointment a
        WHERE a.organization.id = :organizationId
        AND a.startTime >= :start
        AND a.startTime < :end
        """)
    long countAllAppointmentsInPeriod(
        @Param("organizationId")
        Long organizationId,

        @Param("start")
        LocalDateTime start,

        @Param("end")
        LocalDateTime end
    );

    @Query("""
        SELECT COUNT(a)
        FROM Appointment a
        WHERE a.organization.id = :organizationId
        AND a.startTime >= :start
        AND a.startTime < :end
        AND a.status = :status
        """)
    long countAppointmentsByStatusInPeriod(
        @Param("organizationId")
        Long organizationId,

        @Param("start")
        LocalDateTime start,

        @Param("end")
        LocalDateTime end,

        @Param("status")
        AppointmentStatus status
    );
}