# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""OSSure -- trustless parametric insurance against open-source dependency abandonment."""

from genlayer import *


class DepGuard(gl.Contract):
    owner: Address

    def __init__(self):
        self.owner = gl.message.sender_address