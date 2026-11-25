export class DSLError extends Error {}
export class MalformedJSONError extends DSLError {}
export class InvalidQueryError extends DSLError {}
export class SecurityNotFoundError extends DSLError {}
export class AttributeNotFoundError extends DSLError {}
export class OperatorNotFoundError extends DSLError {}
export class InvalidOperationError extends DSLError {}
