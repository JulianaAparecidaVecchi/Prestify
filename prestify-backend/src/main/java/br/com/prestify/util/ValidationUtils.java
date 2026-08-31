package br.com.prestify.util;

public final class ValidationUtils {

    private ValidationUtils() {
    }

    public static boolean isValidCpfOrCnpj(
            String document
    ) {

        if (
            document == null
            || document.isBlank()
        ) {
            return true;
        }

        String digits =
            onlyDigits(document);

        if (digits.length() == 11) {
            return isValidCpf(digits);
        }

        if (digits.length() == 14) {
            return isValidCnpj(digits);
        }

        return false;
    }

    public static boolean isValidPhone(
            String phone
    ) {

        if (
            phone == null
            || phone.isBlank()
        ) {
            return false;
        }

        String digits =
            onlyDigits(phone);

        return digits.length() == 10
            || digits.length() == 11;
    }

    public static String onlyDigits(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value.replaceAll(
            "\\D",
            ""
        );
    }

    private static boolean isValidCpf(
            String cpf
    ) {

        if (
            cpf == null
            || cpf.length() != 11
            || allDigitsEqual(cpf)
        ) {
            return false;
        }

        int firstDigit =
            calculateCpfDigit(
                cpf.substring(
                    0,
                    9
                ),
                10
            );

        int secondDigit =
            calculateCpfDigit(
                cpf.substring(
                    0,
                    9
                ) + firstDigit,
                11
            );

        return firstDigit
                == Character.getNumericValue(
                    cpf.charAt(9)
                )
            && secondDigit
                == Character.getNumericValue(
                    cpf.charAt(10)
                );
    }

    private static int calculateCpfDigit(
            String value,
            int weight
    ) {

        int sum = 0;

        for (
            int i = 0;
            i < value.length();
            i++
        ) {

            int digit =
                Character.getNumericValue(
                    value.charAt(i)
                );

            sum += digit * weight;

            weight--;
        }

        int remainder =
            sum % 11;

        if (remainder < 2) {
            return 0;
        }

        return 11 - remainder;
    }

    private static boolean isValidCnpj(
            String cnpj
    ) {

        if (
            cnpj == null
            || cnpj.length() != 14
            || allDigitsEqual(cnpj)
        ) {
            return false;
        }

        int firstDigit =
            calculateCnpjDigit(
                cnpj.substring(
                    0,
                    12
                )
            );

        int secondDigit =
            calculateCnpjDigit(
                cnpj.substring(
                    0,
                    12
                ) + firstDigit
            );

        return firstDigit
                == Character.getNumericValue(
                    cnpj.charAt(12)
                )
            && secondDigit
                == Character.getNumericValue(
                    cnpj.charAt(13)
                );
    }

    private static int calculateCnpjDigit(
            String value
    ) {

        int[] weights;

        if (value.length() == 12) {

            weights =
                new int[] {
                    5, 4, 3, 2,
                    9, 8, 7, 6,
                    5, 4, 3, 2
                };

        } else {

            weights =
                new int[] {
                    6, 5, 4, 3,
                    2, 9, 8, 7,
                    6, 5, 4, 3,
                    2
                };
        }

        int sum = 0;

        for (
            int i = 0;
            i < value.length();
            i++
        ) {

            int digit =
                Character.getNumericValue(
                    value.charAt(i)
                );

            sum +=
                digit
                * weights[i];
        }

        int remainder =
            sum % 11;

        if (remainder < 2) {
            return 0;
        }

        return 11 - remainder;
    }

    private static boolean allDigitsEqual(
            String value
    ) {

        char first =
            value.charAt(0);

        for (
            int i = 1;
            i < value.length();
            i++
        ) {

            if (
                value.charAt(i)
                    != first
            ) {
                return false;
            }
        }

        return true;
    }
}