export const MESSAGES = {
  CUSTOMER: {
    NOT_FOUND: 'Cliente não encontrado',
    DUPLICATE_DOCUMENT: 'CPF/CNPJ já cadastrado',
    INVALID_DOCUMENT_FORMAT:
      'O documento deve conter apenas números do CPF (11 dígitos) ou CNPJ (14 dígitos)',
  },
  PRODUCT: {
    NOT_FOUND: 'Produto não encontrado:',
    MANY_NOT_FOUND: 'Um ou mais produtos não foram encontrados',
    INVALID_STOCK_VALUE: 'O estoque não pode ser negativo',
    INVALID_PRICE_VALUE: 'O preço não pode ser negativo',
    INSUFICIENT_STOCK: 'Estoque insuficiente para o produto:',
  },
  ORDER: {
    INVALID_ITEM_VALUE: 'Itens do pedido com quantidade inválida',
    NOT_FOUND: 'Pedido não encontrado:',
    STOCK_ERROR: 'Estoque insuficiente para o pedido:',
    STOCK_UPDATED: 'Estoque atualizado para o pedido:',
  },
  EVENTS: {
    UNKNOWN_ERROR: 'Erro desconhecido',
  },
  GENERIC: {
    INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  },
};
