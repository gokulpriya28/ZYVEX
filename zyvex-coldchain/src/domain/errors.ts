export class ValidationError extends Error { constructor(message: string) { super(message); this.name = 'ValidationError'; } }
export class NotFoundError extends Error { constructor(message = 'Record not found') { super(message); this.name = 'NotFoundError'; } }
export class IntegrityError extends Error { constructor(message = 'Integrity check failed') { super(message); this.name = 'IntegrityError'; } }
