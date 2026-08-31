package br.com.prestify.service;

import br.com.prestify.dto.client.ClientCreateRequest;
import br.com.prestify.dto.client.ClientResponse;
import br.com.prestify.dto.client.ClientUpdateRequest;

import br.com.prestify.entity.Client;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.ClientRepository;

import br.com.prestify.security.CurrentUserService;

import br.com.prestify.util.ValidationUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.nio.charset.StandardCharsets;

import java.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import org.apache.pdfbox.pdmodel.common.PDRectangle;

import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

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

        this.clientRepository =
            clientRepository;

        this.currentUserService =
            currentUserService;
    }

    public Page<ClientResponse> list(
            String search,
            Boolean active,
            int page,
            int size
    ) {

        validatePagination(
            page,
            size
        );

        Long organizationId =
            currentUserService
                .getOrganizationId();

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
            currentUserService
                .getOrganizationId();

        validateClientData(
            request.getName(),
            request.getDocument(),
            request.getEmail(),
            request.getPhone()
        );

        String document =
            normalizeDocument(
                request.getDocument()
            );

        validateDocumentAvailable(
            document,
            organizationId,
            null
        );

        Client client =
            new Client();

        client.setName(
            request
                .getName()
                .trim()
        );

        client.setDocument(
            document
        );

        client.setEmail(
            normalizeEmail(
                request.getEmail()
            )
        );

        client.setPhone(
            normalizePhone(
                request.getPhone()
            )
        );

        client.setBirthDate(
            request.getBirthDate()
        );

        client.setNotes(
            normalizeNullable(
                request.getNotes()
            )
        );

        client.setActive(
            true
        );

        client.setOrganization(
            currentUserService
                .getCurrentUser()
                .getOrganization()
        );

        return toResponse(
            clientRepository.save(
                client
            )
        );
    }

    public ClientResponse update(
            Long id,
            ClientUpdateRequest request
    ) {

        Client client =
            findClient(id);

        Long organizationId =
            currentUserService
                .getOrganizationId();

        validateClientData(
            request.getName(),
            request.getDocument(),
            request.getEmail(),
            request.getPhone()
        );

        String document =
            normalizeDocument(
                request.getDocument()
            );

        validateDocumentAvailable(
            document,
            organizationId,
            client.getId()
        );

        client.setName(
            request
                .getName()
                .trim()
        );

        client.setDocument(
            document
        );

        client.setEmail(
            normalizeEmail(
                request.getEmail()
            )
        );

        client.setPhone(
            normalizePhone(
                request.getPhone()
            )
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
            clientRepository.save(
                client
            )
        );
    }

    public ClientResponse changeStatus(
            Long id,
            Boolean active
    ) {

        Client client =
            findClient(id);

        client.setActive(
            active
        );

        return toResponse(
            clientRepository.save(
                client
            )
        );
    }

    public void delete(
            Long id
    ) {

        Client client =
            findClient(id);

        /*
         * Exclusão lógica.
         */
        client.setActive(
            false
        );

        clientRepository.save(
            client
        );
    }

    public byte[] exportCsv(
            String search,
            Boolean active
    ) {

        List<ClientResponse> clients =
            getAllForExport(
                search,
                active
            );

        StringBuilder csv =
            new StringBuilder();

        /*
         * BOM UTF-8.
         *
         * Ajuda o Excel no Windows
         * a reconhecer corretamente acentos.
         */
        csv.append(
            '\uFEFF'
        );

        csv.append(
            "ID;Nome;CPF/CNPJ;E-mail;Telefone;"
        );

        csv.append(
            "Data de Nascimento;Status\r\n"
        );

        DateTimeFormatter dateFormatter =
            DateTimeFormatter.ofPattern(
                "dd/MM/yyyy"
            );

        for (
            ClientResponse client :
            clients
        ) {

            appendCsvField(
                csv,
                String.valueOf(
                    client.getId()
                )
            );

            csv.append(";");

            appendCsvField(
                csv,
                client.getName()
            );

            csv.append(";");

            appendCsvField(
                csv,
                formatDocument(
                    client.getDocument()
                )
            );

            csv.append(";");

            appendCsvField(
                csv,
                client.getEmail()
            );

            csv.append(";");

            appendCsvField(
                csv,
                formatPhone(
                    client.getPhone()
                )
            );

            csv.append(";");

            appendCsvField(
                csv,
                client.getBirthDate()
                    == null
                    ? ""
                    : client
                        .getBirthDate()
                        .format(
                            dateFormatter
                        )
            );

            csv.append(";");

            appendCsvField(
                csv,
                Boolean.TRUE.equals(
                    client.getActive()
                )
                    ? "Ativo"
                    : "Inativo"
            );

            csv.append(
                "\r\n"
            );
        }

        return csv
            .toString()
            .getBytes(
                StandardCharsets.UTF_8
            );
    }

    public byte[] exportPdf(
            String search,
            Boolean active
    ) {

        List<ClientResponse> clients =
            getAllForExport(
                search,
                active
            );

        try (
            PDDocument document =
                new PDDocument();

            ByteArrayOutputStream output =
                new ByteArrayOutputStream()
        ) {

            PDType1Font titleFont =
                new PDType1Font(
                    Standard14Fonts
                        .FontName
                        .HELVETICA_BOLD
                );

            PDType1Font normalFont =
                new PDType1Font(
                    Standard14Fonts
                        .FontName
                        .HELVETICA
                );

            int index = 0;

            do {

                PDPage page =
                    new PDPage(
                        PDRectangle.A4
                    );

                document.addPage(
                    page
                );

                try (
                    PDPageContentStream content =
                        new PDPageContentStream(
                            document,
                            page
                        )
                ) {

                    float y =
                        page
                            .getMediaBox()
                            .getHeight()
                            - 50;

                    content.beginText();

                    content.setFont(
                        titleFont,
                        16
                    );

                    content.newLineAtOffset(
                        50,
                        y
                    );

                    content.showText(
                        "Prestify - Relatorio de Clientes"
                    );

                    content.endText();

                    y -= 35;

                    content.beginText();

                    content.setFont(
                        titleFont,
                        9
                    );

                    content.newLineAtOffset(
                        50,
                        y
                    );

                    content.showText(
                        "ID"
                    );

                    content.newLineAtOffset(
                        35,
                        0
                    );

                    content.showText(
                        "Nome"
                    );

                    content.newLineAtOffset(
                        160,
                        0
                    );

                    content.showText(
                        "CPF/CNPJ"
                    );

                    content.newLineAtOffset(
                        100,
                        0
                    );

                    content.showText(
                        "Telefone"
                    );

                    content.newLineAtOffset(
                        105,
                        0
                    );

                    content.showText(
                        "Status"
                    );

                    content.endText();

                    y -= 18;

                    int rowsOnPage =
                        0;

                    while (
                        index
                            < clients.size()
                        && rowsOnPage
                            < 34
                    ) {

                        ClientResponse client =
                            clients.get(
                                index
                            );

                        content.beginText();

                        content.setFont(
                            normalFont,
                            8
                        );

                        content.newLineAtOffset(
                            50,
                            y
                        );

                        content.showText(
                            pdfText(
                                String.valueOf(
                                    client.getId()
                                ),
                                5
                            )
                        );

                        content.newLineAtOffset(
                            35,
                            0
                        );

                        content.showText(
                            pdfText(
                                client
                                    .getName(),
                                26
                            )
                        );

                        content.newLineAtOffset(
                            160,
                            0
                        );

                        content.showText(
                            pdfText(
                                formatDocument(
                                    client
                                        .getDocument()
                                ),
                                17
                            )
                        );

                        content.newLineAtOffset(
                            100,
                            0
                        );

                        content.showText(
                            pdfText(
                                formatPhone(
                                    client
                                        .getPhone()
                                ),
                                18
                            )
                        );

                        content.newLineAtOffset(
                            105,
                            0
                        );

                        content.showText(
                            Boolean.TRUE.equals(
                                client
                                    .getActive()
                            )
                                ? "Ativo"
                                : "Inativo"
                        );

                        content.endText();

                        y -= 19;

                        index++;

                        rowsOnPage++;
                    }
                }

            } while (
                index
                    < clients.size()
                || document
                    .getNumberOfPages()
                    == 0
            );

            document.save(
                output
            );

            return output
                .toByteArray();

        } catch (
            IOException ex
        ) {

            throw new BusinessException(
                "Não foi possível gerar o PDF de clientes."
            );
        }
    }

    private List<ClientResponse>
        getAllForExport(
            String search,
            Boolean active
        ) {

        List<ClientResponse> clients =
            new ArrayList<>();

        int pageNumber =
            0;

        Page<ClientResponse> page;

        do {

            page =
                list(
                    search,
                    active,
                    pageNumber,
                    100
                );

            clients.addAll(
                page.getContent()
            );

            pageNumber++;

        } while (
            page.hasNext()
        );

        return clients;
    }

    private void validateClientData(
            String name,
            String document,
            String email,
            String phone
    ) {

        if (
            name == null
            || name.isBlank()
        ) {

            throw new BusinessException(
                "O nome é obrigatório."
            );
        }

        if (
            document != null
            && !document.isBlank()
            && !ValidationUtils
                .isValidCpfOrCnpj(
                    document
                )
        ) {

            throw new BusinessException(
                "Informe um CPF ou CNPJ válido."
            );
        }

        if (
            !ValidationUtils
                .isValidPhone(
                    phone
                )
        ) {

            throw new BusinessException(
                "Informe um telefone válido com DDD."
            );
        }

        if (
            email != null
            && !email.isBlank()
            && !isValidEmail(
                email
            )
        ) {

            throw new BusinessException(
                "Informe um e-mail válido."
            );
        }
    }

    private boolean isValidEmail(
            String email
    ) {

        return email.matches(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        );
    }

    private void appendCsvField(
            StringBuilder csv,
            String value
    ) {

        String safeValue =
            value == null
                ? ""
                : value;

        csv.append(
            "\""
        );

        csv.append(
            safeValue.replace(
                "\"",
                "\"\""
            )
        );

        csv.append(
            "\""
        );
    }

    private String pdfText(
            String value,
            int maxLength
    ) {

        if (
            value == null
            || value.isBlank()
        ) {

            return "-";
        }

        String safe =
            value
                .replace(
                    "\r",
                    " "
                )
                .replace(
                    "\n",
                    " "
                );

        StringBuilder result =
            new StringBuilder();

        for (
            int i = 0;
            i < safe.length();
            i++
        ) {

            char character =
                safe.charAt(i);

            if (
                character >= 32
                && character <= 255
            ) {

                result.append(
                    character
                );

            } else {

                result.append(
                    "?"
                );
            }
        }

        if (
            result.length()
                > maxLength
        ) {

            return result
                .substring(
                    0,
                    maxLength - 3
                )
                + "...";
        }

        return result.toString();
    }

    private Client findClient(
            Long id
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

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

        if (
            currentClientId
                == null
        ) {

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

    private String normalizeDocument(
            String value
    ) {

        if (
            value == null
            || value.isBlank()
        ) {

            return null;
        }

        return ValidationUtils
            .onlyDigits(
                value
            );
    }

    private String normalizePhone(
            String value
    ) {

        return ValidationUtils
            .onlyDigits(
                value
            );
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

    private String formatDocument(
            String document
    ) {

        if (
            document == null
            || document.isBlank()
        ) {

            return "";
        }

        String digits =
            ValidationUtils
                .onlyDigits(
                    document
                );

        if (
            digits.length()
                == 11
        ) {

            return String.format(
                "%s.%s.%s-%s",
                digits.substring(
                    0,
                    3
                ),
                digits.substring(
                    3,
                    6
                ),
                digits.substring(
                    6,
                    9
                ),
                digits.substring(
                    9,
                    11
                )
            );
        }

        if (
            digits.length()
                == 14
        ) {

            return String.format(
                "%s.%s.%s/%s-%s",
                digits.substring(
                    0,
                    2
                ),
                digits.substring(
                    2,
                    5
                ),
                digits.substring(
                    5,
                    8
                ),
                digits.substring(
                    8,
                    12
                ),
                digits.substring(
                    12,
                    14
                )
            );
        }

        return document;
    }

    private String formatPhone(
            String phone
    ) {

        if (
            phone == null
            || phone.isBlank()
        ) {

            return "";
        }

        String digits =
            ValidationUtils
                .onlyDigits(
                    phone
                );

        if (
            digits.length()
                == 11
        ) {

            return String.format(
                "(%s) %s-%s",
                digits.substring(
                    0,
                    2
                ),
                digits.substring(
                    2,
                    7
                ),
                digits.substring(
                    7,
                    11
                )
            );
        }

        if (
            digits.length()
                == 10
        ) {

            return String.format(
                "(%s) %s-%s",
                digits.substring(
                    0,
                    2
                ),
                digits.substring(
                    2,
                    6
                ),
                digits.substring(
                    6,
                    10
                )
            );
        }

        return phone;
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