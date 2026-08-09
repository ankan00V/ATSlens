def get_remote_address(request):
    if hasattr(request, "client") and request.client and hasattr(request.client, "host"):
        return request.client.host
    return "127.0.0.1"
