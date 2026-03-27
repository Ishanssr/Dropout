/**
 * Input sanitization & validation utilities
 */

// Strip HTML tags and limit length
function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')     // strip HTML tags
    .replace(/[<>]/g, '')         // remove any remaining angle brackets  
    .trim()
    .slice(0, maxLength);
}

// Validate email format
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Validate URL format
function isValidUrl(url) {
  if (typeof url !== 'string' || !url) return true; // optional fields
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch { return false; }
}

// Password strength check
function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password too long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null; // valid
}

// Sanitize a username
function sanitizeUsername(input) {
  if (typeof input !== 'string') return '';
  return input.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 30);
}

// Validate drop fields
function validateDropInput(body) {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 1) errors.push('Title is required');
  if (body.title && body.title.length > 200) errors.push('Title too long (max 200)');
  if (!body.description || typeof body.description !== 'string') errors.push('Description is required');
  if (body.description && body.description.length > 2000) errors.push('Description too long (max 2000)');
  if (!body.imageUrl || typeof body.imageUrl !== 'string') errors.push('Image URL is required');
  if (body.imageUrl && !isValidUrl(body.imageUrl)) errors.push('Invalid image URL');
  if (!body.category || typeof body.category !== 'string') errors.push('Category is required');
  if (body.website && !isValidUrl(body.website)) errors.push('Invalid website URL');
  if (!body.dropTime) errors.push('Drop time is required');
  if (body.dropTime && isNaN(new Date(body.dropTime).getTime())) errors.push('Invalid drop time');
  
  const validAccessTypes = ['open', 'raffle', 'waitlist', 'invite'];
  if (body.accessType && !validAccessTypes.includes(body.accessType)) errors.push('Invalid access type');

  return errors.length > 0 ? errors : null;
}

module.exports = { sanitizeText, isValidEmail, isValidUrl, validatePassword, sanitizeUsername, validateDropInput };
