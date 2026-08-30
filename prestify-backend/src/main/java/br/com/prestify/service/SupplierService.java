package br.com.prestify.service;

import br.com.prestify.dto.supplier.SupplierCreateRequest;
import br.com.prestify.dto.supplier.SupplierResponse;
import br.com.prestify.dto.supplier.SupplierStatusRequest;
import br.com.prestify.dto.supplier.SupplierUpdateRequest;

import br.com.prestify.entity.Supplier;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.SupplierRepository;

import br.com.prestify.security.CurrentUserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final CurrentUserService currentUserService;

    public SupplierService(
            SupplierRepository supplierRepository,
            CurrentUserService currentUserService
    ) {
        this.supplierRepository = supplierRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public SupplierResponse create(
            SupplierCreateRequest request
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        String document =
            normalizeNullable(request.getDocument());

        validateDuplicateDocument(
            organizationId,
            document,
            null
        );

        Supplier supplier = new Supplier();

        supplier.setName(
            request.getName().trim()
        );

        supplier.setDocument(document);

        supplier.setEmail(
            normalizeNullable(request.getEmail())
        );

        supplier.setPhone(
            normalizeNullable(request.getPhone())
        );

        supplier.setAddress(
            normalizeNullable(request.getAddress())
        );

        supplier.setNotes(
            normalizeNullable(request.getNotes())
        );

        supplier.setActive(true);

        supplier.setOrganization(
            currentUserService
                .getCurrentUser()
                .getOrganization()
        );

        Supplier savedSupplier =
            supplierRepository.save(supplier);

        return toResponse(savedSupplier);
    }

    public Page<SupplierResponse> list(
            String search,
            Boolean active,
            int page,
            int size
    ) {

        validatePagination(page, size);

        Long organizationId =
            currentUserService.getOrganizationId();

        String normalizedSearch =
            normalizeNullable(search);

        return supplierRepository
            .search(
                organizationId,
                normalizedSearch,
                active,
                PageRequest.of(
                    page,
                    size,
                    Sort.by(
                        Sort.Direction.ASC,
                        "name"
                    )
                )
            )
            .map(this::toResponse);
    }

    public SupplierResponse getById(
            Long id
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        Supplier supplier =
            findSupplier(
                id,
                organizationId
            );

        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse update(
            Long id,
            SupplierUpdateRequest request
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        Supplier supplier =
            findSupplier(
                id,
                organizationId
            );

        String document =
            normalizeNullable(request.getDocument());

        validateDuplicateDocument(
            organizationId,
            document,
            id
        );

        supplier.setName(
            request.getName().trim()
        );

        supplier.setDocument(document);

        supplier.setEmail(
            normalizeNullable(request.getEmail())
        );

        supplier.setPhone(
            normalizeNullable(request.getPhone())
        );

        supplier.setAddress(
            normalizeNullable(request.getAddress())
        );

        supplier.setNotes(
            normalizeNullable(request.getNotes())
        );

        Supplier savedSupplier =
            supplierRepository.save(supplier);

        return toResponse(savedSupplier);
    }

    @Transactional
    public SupplierResponse changeStatus(
            Long id,
            SupplierStatusRequest request
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        Supplier supplier =
            findSupplier(
                id,
                organizationId
            );

        supplier.setActive(
            request.getActive()
        );

        Supplier savedSupplier =
            supplierRepository.save(supplier);

        return toResponse(savedSupplier);
    }

    @Transactional
    public void delete(
            Long id
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        Supplier supplier =
            findSupplier(
                id,
                organizationId
            );

        supplier.setActive(false);

        supplierRepository.save(supplier);
    }

    private Supplier findSupplier(
            Long id,
            Long organizationId
    ) {

        return supplierRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Fornecedor não encontrado."
                    )
            );
    }

    private void validateDuplicateDocument(
            Long organizationId,
            String document,
            Long supplierId
    ) {

        if (document == null) {
            return;
        }

        boolean exists;

        if (supplierId == null) {

            exists =
                supplierRepository
                    .existsByOrganizationIdAndDocumentIgnoreCase(
                        organizationId,
                        document
                    );

        } else {

            exists =
                supplierRepository
                    .existsByOrganizationIdAndDocumentIgnoreCaseAndIdNot(
                        organizationId,
                        document,
                        supplierId
                    );
        }

        if (exists) {
            throw new BusinessException(
                "Já existe um fornecedor com este CPF/CNPJ."
            );
        }
    }

    private SupplierResponse toResponse(
            Supplier supplier
    ) {

        return new SupplierResponse(
            supplier.getId(),
            supplier.getName(),
            supplier.getDocument(),
            supplier.getEmail(),
            supplier.getPhone(),
            supplier.getAddress(),
            supplier.getNotes(),
            supplier.getActive(),
            supplier.getCreatedAt(),
            supplier.getUpdatedAt()
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
}