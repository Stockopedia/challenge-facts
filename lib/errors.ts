// we had plain errors until now and they all look the same , with this approach we have a class for each kind of problem so we can tell them apart
// the message is still what the user reads

// text isn't valid JSON
export class InvalidJsonError extends Error {
  name = "InvalidJsonError";
}

// JSON is fine but not the shape we expected
export class InvalidShapeError extends Error {
  name = "InvalidShapeError";
}

// a security, an attribute or a fact we were asked for is not in the data
export class LookupError extends Error {
  name = "LookupError";
}

export class DivisionByZeroError extends Error {
  name = "DivisionByZeroError";
}
