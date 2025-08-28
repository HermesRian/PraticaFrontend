/**
 * Validação de CPF
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean} - true se o CPF for válido, false caso contrário
 */
export const validarCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
  
  return true;
};

/**
 * Validação de CNPJ
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean} - true se o CNPJ for válido, false caso contrário
 */
export const validarCNPJ = (cnpj) => {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) return false;
  
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
  
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  let digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};

/**
 * Validação de CPF/CNPJ em tempo real
 * @param {string} valor - CPF ou CNPJ com ou sem formatação
 * @param {string} tipo - "FISICA" para CPF ou "JURIDICA" para CNPJ
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validarCpfCnpjEmTempoReal = (valor, tipo) => {
  if (!valor) return { isValid: true, message: '' };
  
  const valorLimpo = valor.replace(/\D/g, '');
  const isCpf = tipo === 'FISICA';
  const tamanhoEsperado = isCpf ? 11 : 14;
  
  if (valorLimpo.length < tamanhoEsperado) {
    return { isValid: true, message: '' };
  }
  
  if (valorLimpo.length === tamanhoEsperado) {
    const isDocumentoValido = isCpf ? validarCPF(valorLimpo) : validarCNPJ(valorLimpo);
    if (!isDocumentoValido) {
      return { 
        isValid: false, 
        message: `${isCpf ? 'CPF' : 'CNPJ'} inválido` 
      };
    }
    return { isValid: true, message: '' };
  }
  
  return { 
    isValid: false, 
    message: `${isCpf ? 'CPF' : 'CNPJ'} deve ter ${tamanhoEsperado} dígitos` 
  };
};

/**
 * Formatação de CPF
 * @param {string} value - CPF sem formatação
 * @returns {string} - CPF formatado (xxx.xxx.xxx-xx)
 */
export const formatCPF = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue.length <= 11) {
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  }
  return cleanValue;
};

/**
 * Formatação de CNPJ
 * @param {string} value - CNPJ sem formatação
 * @returns {string} - CNPJ formatado (xx.xxx.xxx/xxxx-xx)
 */
export const formatCNPJ = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue.length <= 14) {
    return cleanValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2');
  }
  return cleanValue;
};

/**
 * Formatação de CEP
 * @param {string} value - CEP sem formatação
 * @returns {string} - CEP formatado (xxxxx-xxx)
 */
export const formatCEP = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue.length <= 8) {
    return cleanValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  }
  return cleanValue;
};

/**
 * Formatação de Telefone
 * @param {string} value - Telefone sem formatação
 * @returns {string} - Telefone formatado ((xx) xxxx-xxxx ou (xx) xxxxx-xxxx)
 */
export const formatTelefone = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue.length <= 11) {
    if (cleanValue.length <= 10) {
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})/, '$1-$2');
    } else {
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})/, '$1-$2');
    }
  }
  return cleanValue;
};

/**
 * Formatação de RG
 * @param {string} value - RG sem formatação
 * @returns {string} - RG formatado (xx.xxx.xxx-x)
 */
export const formatRG = (value) => {
  const cleanValue = value.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (cleanValue.length <= 9) {
    return cleanValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1})/, '$1-$2');
  }
  return cleanValue;
};

/**
 * Formatação de Inscrição Estadual
 * @param {string} value - IE sem formatação
 * @returns {string} - IE formatada (genérica)
 */
export const formatIE = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue.length <= 15) {
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,3})/, '$1-$2');
  }
  return cleanValue;
};

/**
 * Censura parcialmente o CPF mostrando apenas os 3 primeiros e 2 últimos dígitos
 * @param {string} value - CPF com ou sem formatação
 * @returns {string} - CPF parcialmente censurado (xxx.***.***-xx)
 */
export const censurarCPF = (value) => {
  if (!value) return '';
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue.length !== 11) return formatCPF(cleanValue);
  
  return `${cleanValue.substring(0, 3)}.***.***-${cleanValue.substring(9, 11)}`;
};

/**
 * Censura parcialmente o CNPJ mostrando apenas os 2 primeiros e 4 últimos dígitos
 * @param {string} value - CNPJ com ou sem formatação
 * @returns {string} - CNPJ parcialmente censurado
 */
export const censurarCNPJ = (value) => {
  if (!value) return '';
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (cleanValue.length !== 14) return formatCNPJ(cleanValue);
  
  return `${cleanValue.substring(0, 2)}.***.***/****-${cleanValue.substring(10, 14)}`;
};
