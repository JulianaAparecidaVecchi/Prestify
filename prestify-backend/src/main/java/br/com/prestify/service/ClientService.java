package br.com.prestify.service;

import br.com.prestify.dto.client.ClientCreateRequest;
import br.com.prestify.dto.client.ClientResponse;
import br.com.prestify.dto.client.ClientUpdateRequest;

import br.com.prestify.entity.Client;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.ClientRepository;

import br.com.prestify.security.CurrentUserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final CurrentUserService currentUserService;

    public ClientService(
            ClientRepository clientRepository,
            CurrentUserService currentUserService
    ) {
        this.clientRepository = clientRepository;
        this.currentUserService = currentUserService;
    }

    public Page<ClientResponse> list(
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

        Page<Client> clients =
            clientRepository.search(
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

        return clients.map(
            this::toResponse
        );
    }

    public ClientResponse getById(
            Long id
    ) {

        return toResponse(
            findClient(id)
        );
    }

    public ClientResponse create(
            ClientCreateRequest request
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        String document =
            normalizeNullable(
                request.getDocument()
            );

        validateDocumentAvailable(
            document,
            organizationId,
            null
        );

        Client client = new Client();

        client.setName(
            request.getName().trim()
        );

        client.setDocument(document);

        client.setEmail(
            normalizeEmail(
                request.getEmail()
            )
        );

        client.setPhone(
            request.getPhone().trim()
        );

        client.setBirthDate(
            request.getBirthDate()
        );

        client.setNotes(
            normalizeNullable(
                request.getNotes()
            )
        );

        client.setActive(true);

        client.setOrganization(
            currentUserService
                .getCurrentUser()
                .getOrganization()
        );

        return toResponse(
            clientRepository.save(client)
        );
    }

    public ClientResponse update(
            Long id,
            ClientUpdateRequest request
    ) {

        Client client =
            findClient(id);

        Long organizationId =
            currentUserService.getOrganizationId();

        String document =
            normalizeNullable(
                request.getDocument()
            );

        validateDocumentAvailable(
            document,
            organizationId,
            client.getId()
        );

        client.setName(
            request.getName().trim()
        );

        client.setDocument(document);

        client.setEmail(
            normalizeEmail(
                request.getEmail()
            )
        );

        client.setPhone(
            request.getPhone().trim()
        );

        client.setBirthDate(
            request.getBirthDate()
        );

        client.setNotes(
            normalizeNullable(
                request.getNotes()
            )
        );

        return toResponse(
            clientRepository.save(client)
        );
    }

    public ClientResponse changeStatus(
            Long id,
            Boolean active
    ) {

        Client client =
            findClient(id);

        client.setActive(active);

        return toResponse(
            clientRepository.save(client)
        );
    }

    public void delete(
            Long id
    ) {

        Client client =
            findClient(id);

        /*
         * Exclusão lógica.
         *
         * O cliente permanece no banco
         * porque futuramente poderá possuir
         * agendamentos, movimentações
         * financeiras e outros históricos.
         */
        client.setActive(false);

        clientRepository.save(client);
    }

    private Client findClient(
            Long id
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

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

    private void validateDocumentAvailable(
            String document,
            Long organizationId,
            Long currentClientId
    ) {

        if (document == null) {
            return;
        }

        boolean exists;

        if (currentClientId == null) {

            exists =
                clientRepository
                    .existsByDocumentAndOrganizationId(
                        document,
                        organizationId
                    );

        } else {

            exists =
                clientRepository
                    .existsByDocumentAndOrganizationIdAndIdNot(
                        document,
                        organizationId,
                        currentClientId
                    );
        }

        if (exists) {

            throw new BusinessException(
                "Já existe um cliente com este CPF/CNPJ."
            );
        }
    }

    private String normalizeEmail(
            String value
    ) {

        if (
            value == null
            || value.isBlank()
        ) {
            return null;
        }

        return value
            .trim()
            .toLowerCase();
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

    private ClientResponse toResponse(
            Client client
    ) {

        return new ClientResponse(
            client.getId(),
            client.getName(),
            client.getDocument(),
            client.getEmail(),
            client.getPhone(),
            client.getBirthDate(),
            client.getNotes(),
            client.getActive(),
            client.getCreatedAt(),
            client.getUpdatedAt()
        );
    }
}