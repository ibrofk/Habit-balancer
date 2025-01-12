// Comprehensive Validation Utility

class Validator {
  // Generic validation method
  static validate(value, rules) {
    const errors = [];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push('This field is required');
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push('Invalid format');
    }

    return errors;
  }

  // Specific validators
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.validate(email, {
      required: true,
      pattern: emailRegex
    });
  }

  static validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return this.validate(password, {
      required: true,
      minLength: 8,
      pattern: passwordRegex
    });
  }

  static validateTaskName(name) {
    return this.validate(name, {
      required: true,
      minLength: 3,
      maxLength: 50
    });
  }

  static validatePoints(points) {
    if (typeof points !== 'number' || points < 0) {
      return ['Points must be a non-negative number'];
    }
    return [];
  }

  // Comprehensive form validation
  static validateForm(formData, validationRules) {
    const errors = {};

    Object.keys(validationRules).forEach(field => {
      const fieldErrors = this.validate(
        formData[field], 
        validationRules[field]
      );

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Predefined validation rule sets
export const ValidationRules = {
  login: {
    email: { 
      required: true, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    password: { 
      required: true, 
      minLength: 8 
    }
  },
  task: {
    name: { 
      required: true, 
      minLength: 3, 
      maxLength: 50 
    },
    points: { 
      required: true 
    }
  }
};

export default Validator;
