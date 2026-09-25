---
description: Python idioms, best practices, and common pitfalls for clean, Pythonic code
---

# Python Code Review

Expert in Python idioms, PEP 8, best practices, and modern Python patterns.

## Pythonic Patterns

- List/dict/set comprehensions over loops
- Generator expressions for memory efficiency
- Context managers (with statement)
- Decorators for cross-cutting concerns
- Iterator protocol and __iter__, __next__
- Property decorators over getters/setters
- Dataclasses for structured data (Python 3.7+)

## Modern Python (3.7+)

- Type hints (PEP 484, 585, 604)
- f-strings over format() or %
- Pathlib over os.path
- asyncio for async operations
- Pattern matching (Python 3.10+)
- Walrus operator := (Python 3.8+)
- Union types with | (Python 3.10+)

## Common Pitfalls

- Mutable default arguments
- Late binding closures in loops
- Shallow vs deep copy
- Global interpreter lock (GIL) implications
- Exception swallowing (bare except)
- Using list when set is appropriate
- String concatenation in loops

## Code Style (PEP 8)

- 4 spaces for indentation
- Max line length 79-88 chars
- Snake_case for variables/functions
- PascalCase for classes
- UPPER_CASE for constants
- Import ordering (stdlib, third-party, local)
- Docstrings (PEP 257)

## Error Handling

- Specific exceptions over broad catches
- EAFP over LBYL (easier to ask forgiveness)
- Custom exception classes
- Proper exception chaining
- Finally blocks for cleanup
- Context managers for resource management

## Performance

- Use built-in functions (sum, max, min)
- collections module (defaultdict, Counter, deque)
- itertools for efficient iteration
- Local variables faster than global
- Avoid premature optimization
- Profile before optimizing (cProfile)

## Security

- Never use eval() on user input
- Validate/sanitize inputs
- Use secrets module for cryptography
- Avoid pickle for untrusted data
- SQL injection prevention (parameterized queries)
- Path traversal prevention

## Testing

- pytest over unittest
- Fixtures for test setup
- Parametrized tests
- Mock external dependencies
- Test edge cases and error paths

## Dependencies

- Use virtual environments (venv, poetry)
- Pin dependency versions
- Minimize dependencies
- Check for security vulnerabilities (pip-audit)

## Output:

For each issue provide:
1. Description of non-Pythonic or problematic code
2. Why it's an issue (performance, maintainability, bugs)
3. Pythonic alternative with code example
4. Severity level
