"""Guard against a missing working directory.

Some tooling here has been launched with a cwd that no longer exists, which
makes os.getcwd() raise and takes down anything that calls it. Fall back to the
directory this file lives in (the project root) rather than a hardcoded path,
so the shim works on any machine and in any deployment.
"""

import os

try:
    os.getcwd()
except Exception:
    _root = os.path.dirname(os.path.abspath(__file__))
    os.getcwd = lambda: _root
