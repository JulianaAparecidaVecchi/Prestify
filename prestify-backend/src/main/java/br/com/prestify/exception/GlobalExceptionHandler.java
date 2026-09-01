package br.com.prestify.exception;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger =
        LoggerFactory.getLogger(
            GlobalExceptionHandler.class
        );

    /*
     * =========================
     * AUTENTICAÇÃO
     * =========================
     */

    @ExceptionHandler(
        InvalidCredentialsException.class
    )
    public ResponseEntity<ApiError>
        handleInvalidCredentials(
            InvalidCredentialsException exception,
            HttpServletRequest request
        ) {

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                exception.getMessage(),
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.UNAUTHORIZED
            )
            .body(
                error
            );
    }

    /*
     * =========================
     * ACESSO NEGADO
     * =========================
     *
     * O usuário está autenticado,
     * porém não possui permissão
     * para acessar o recurso.
     *
     * Exemplo:
     * EMPLOYEE tentando acessar
     * um endpoint permitido apenas
     * para OWNER ou ADMIN.
     */
    @ExceptionHandler(
        AccessDeniedException.class
    )
    public ResponseEntity<ApiError>
        handleAccessDenied(
            AccessDeniedException exception,
            HttpServletRequest request
        ) {

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                "Você não possui permissão para realizar esta operação.",
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.FORBIDDEN
            )
            .body(
                error
            );
    }

    /*
     * =========================
     * RECURSO NÃO ENCONTRADO
     * =========================
     */

    @ExceptionHandler(
        ResourceNotFoundException.class
    )
    public ResponseEntity<ApiError>
        handleResourceNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
        ) {

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                exception.getMessage(),
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.NOT_FOUND
            )
            .body(
                error
            );
    }

    /*
     * =========================
     * REGRA DE NEGÓCIO
     * =========================
     */

    @ExceptionHandler(
        BusinessException.class
    )
    public ResponseEntity<ApiError>
        handleBusinessException(
            BusinessException exception,
            HttpServletRequest request
        ) {

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Business Rule Violation",
                exception.getMessage(),
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.BAD_REQUEST
            )
            .body(
                error
            );
    }

    /*
     * =========================
     * VALIDAÇÃO DE DTO
     * =========================
     */

    @ExceptionHandler(
        MethodArgumentNotValidException.class
    )
    public ResponseEntity<ApiError>
        handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
        ) {

        Map<String, String> fields =
            new HashMap<>();

        exception
            .getBindingResult()
            .getFieldErrors()
            .forEach(
                error ->
                    fields.put(
                        error.getField(),
                        error.getDefaultMessage()
                    )
            );

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                "Existem campos inválidos.",
                request.getRequestURI(),
                fields
            );

        return ResponseEntity
            .status(
                HttpStatus.BAD_REQUEST
            )
            .body(
                error
            );
    }

    /*
     * =========================
     * VALIDAÇÃO DE PARÂMETROS
     * =========================
     */

    @ExceptionHandler(
        HandlerMethodValidationException.class
    )
    public ResponseEntity<ApiError>
        handleMethodValidation(
            HandlerMethodValidationException exception,
            HttpServletRequest request
        ) {

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                "Existem parâmetros inválidos na requisição.",
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.BAD_REQUEST
            )
            .body(
                error
            );
    }

    /*
     * Parâmetro obrigatório da URL
     * não informado.
     *
     * Exemplo:
     * /api/appointments sem start
     * ou end, caso estes parâmetros
     * sejam obrigatórios.
     */
    @ExceptionHandler(
        MissingServletRequestParameterException.class
    )
    public ResponseEntity<ApiError>
        handleMissingRequestParameter(
            MissingServletRequestParameterException exception,
            HttpServletRequest request
        ) {

        String message =
            "O parâmetro '"
            + exception.getParameterName()
            + "' é obrigatório.";

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                message,
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.BAD_REQUEST
            )
            .body(
                error
            );
    }

    /*
     * Parâmetro informado com tipo
     * ou formato incompatível.
     *
     * Exemplos:
     *
     * page=abc
     *
     * start=data-invalida
     */
    @ExceptionHandler(
        MethodArgumentTypeMismatchException.class
    )
    public ResponseEntity<ApiError>
        handleArgumentTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
        ) {

        String message =
            "O parâmetro '"
            + exception.getName()
            + "' possui um valor inválido.";

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                message,
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.BAD_REQUEST
            )
            .body(
                error
            );
    }

    /*
     * =========================
     * JSON INVÁLIDO
     * =========================
     */

    @ExceptionHandler(
        HttpMessageNotReadableException.class
    )
    public ResponseEntity<ApiError>
        handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
        ) {

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "O corpo da requisição está inválido.",
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.BAD_REQUEST
            )
            .body(
                error
            );
    }

    /*
     * =========================
     * ERRO NÃO PREVISTO
     * =========================
     *
     * Não devolvemos detalhes
     * técnicos para o frontend.
     *
     * Porém registramos o stack
     * trace completo no servidor
     * para facilitar diagnóstico
     * e manutenção.
     */
    @ExceptionHandler(
        Exception.class
    )
    public ResponseEntity<ApiError>
        handleGenericException(
            Exception exception,
            HttpServletRequest request
        ) {

        logger.error(
            "Erro interno não tratado em {} {}",
            request.getMethod(),
            request.getRequestURI(),
            exception
        );

        ApiError error =
            new ApiError(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Ocorreu um erro interno no servidor.",
                request.getRequestURI()
            );

        return ResponseEntity
            .status(
                HttpStatus.INTERNAL_SERVER_ERROR
            )
            .body(
                error
            );
    }
}