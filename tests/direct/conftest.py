import os

_original_unlink = os.unlink


def _windows_safe_unlink(path):
    try:
        _original_unlink(path)
    except PermissionError:
        # genlayer-test dups the temp message file onto stdin; Windows cannot
        # delete it until the fd is released.
        pass


os.unlink = _windows_safe_unlink
