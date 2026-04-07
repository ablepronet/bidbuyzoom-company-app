export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

/**
 * Validate numeric field
 */
export const validateNumeric = (value: string, fieldName: string): ValidationResult => {
  const requiredResult = validateRequired(value, fieldName);
  if (!requiredResult.isValid) {
    return requiredResult;
  }

  if (isNaN(Number(value)) || Number(value) < 0) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid positive number`,
    };
  }
  return { isValid: true };
};

/**
 * Validate lot number
 */
export const validateLotNumber = (lotNumber: string): ValidationResult => {
  const requiredResult = validateRequired(lotNumber, 'Lot number');
  if (!requiredResult.isValid) {
    return requiredResult;
  }

  if (!/^\d+$/.test(lotNumber.trim())) {
    return {
      isValid: false,
      error: 'Lot number must contain only digits',
    };
  }

  return { isValid: true };
};

/**
 * Validate title
 */
export const validateTitle = (title: string): ValidationResult => {
  const requiredResult = validateRequired(title, 'Title');
  if (!requiredResult.isValid) {
    return requiredResult;
  }

  if (title.trim().length < 3) {
    return {
      isValid: false,
      error: 'Title must be at least 3 characters long',
    };
  }

  if (title.trim().length > 200) {
    return {
      isValid: false,
      error: 'Title must not exceed 200 characters',
    };
  }

  return { isValid: true };
};

/**
 * Validate description
 */
export const validateDescription = (description: string): ValidationResult => {
  if (description && description.trim().length > 1000) {
    return {
      isValid: false,
      error: 'Description must not exceed 1000 characters',
    };
  }
  return { isValid: true };
};

/**
 * Validate quantity
 */
export const validateQuantity = (quantity: string): ValidationResult => {
  const numericResult = validateNumeric(quantity, 'Quantity');
  if (!numericResult.isValid) {
    return numericResult;
  }

  const qty = Number(quantity);
  if (qty < 1) {
    return {
      isValid: false,
      error: 'Quantity must be at least 1',
    };
  }

  if (qty > 9999) {
    return {
      isValid: false,
      error: 'Quantity must not exceed 9999',
    };
  }

  return { isValid: true };
};

/**
 * Validate price fields (start price, buy now price, reserve)
 */
export const validatePrice = (price: string, fieldName: string): ValidationResult => {
  const numericResult = validateNumeric(price, fieldName);
  if (!numericResult.isValid) {
    return numericResult;
  }

  const priceValue = Number(price);
  if (priceValue < 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be negative`,
    };
  }

  if (priceValue > 999999999) {
    return {
      isValid: false,
      error: `${fieldName} is too high`,
    };
  }

  return { isValid: true };
};

/**
 * Validate price relationships (buy now > start, reserve >= start, etc.)
 */
export const validatePriceRelationships = (
  startPrice: string,
  buyNowPrice: string,
  reserve: string
): ValidationResult => {
  const start = Number(startPrice) || 0;
  const buyNow = Number(buyNowPrice) || 0;
  const reserveValue = Number(reserve) || 0;

  // Buy now price should be greater than start price
  if (buyNow > 0 && start > 0 && buyNow <= start) {
    return {
      isValid: false,
      error: 'Buy now price must be greater than start price',
    };
  }

  // Reserve should be greater than or equal to start price
  if (reserveValue > 0 && start > 0 && reserveValue < start) {
    return {
      isValid: false,
      error: 'Reserve price must be greater than or equal to start price',
    };
  }

  return { isValid: true };
};

/**
 * Validate category selection
 */
export const validateCategory = (category: string): ValidationResult => {
  const requiredResult = validateRequired(category, 'Category');
  if (!requiredResult.isValid) {
    return requiredResult;
  }
  return { isValid: true };
};

/**
 * Validate complete lot form
 */
export const validateLotForm = (formData: {
  lotNumber: string;
  title: string;
  description: string;
  quantity: string;
  startPrice: string;
  buyNowPrice: string;
  reserve: string;
}): ValidationResult => {
  // Validate required fields
  const validations = [
    validateLotNumber(formData.lotNumber),
    validateTitle(formData.title),
    validateQuantity(formData.quantity),
    validatePrice(formData.startPrice, 'Start price'),
  ];

  // Check if any validation failed
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }

  // Validate optional fields if provided
  if (formData.buyNowPrice) {
    const buyNowValidation = validatePrice(formData.buyNowPrice, 'Buy now price');
    if (!buyNowValidation.isValid) {
      return buyNowValidation;
    }
  }

  if (formData.reserve) {
    const reserveValidation = validatePrice(formData.reserve, 'Reserve price');
    if (!reserveValidation.isValid) {
      return reserveValidation;
    }
  }

  // Validate description if provided
  if (formData.description) {
    const descValidation = validateDescription(formData.description);
    if (!descValidation.isValid) {
      return descValidation;
    }
  }

  // Validate price relationships
  const priceRelationshipValidation = validatePriceRelationships(
    formData.startPrice,
    formData.buyNowPrice,
    formData.reserve
  );
  if (!priceRelationshipValidation.isValid) {
    return priceRelationshipValidation;
  }

  return { isValid: true };
};

/**
 * Validate images array
 */
export const validateImages = (images: Array<{ uri: string | null }>): ValidationResult => {
  if (!images || images.length === 0) {
    return {
      isValid: false,
      error: 'At least one image is required',
    };
  }

  const validImages = images.filter(img => img && img.uri);
  if (validImages.length === 0) {
    return {
      isValid: false,
      error: 'Please add at least one image',
    };
  }

  return { isValid: true };
};
