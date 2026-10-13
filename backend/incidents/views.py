from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from incidents.models import Incident
from incidents.serializers import IncidentSerializer


class IncidentListView(generics.ListAPIView):
    """
    Return all security incidents.
    """

    permission_classes = [IsAuthenticated]

    queryset = Incident.objects.prefetch_related(
        "alerts",
        "alerts__detection",
    ).order_by("-detected_at")

    serializer_class = IncidentSerializer


class IncidentDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a single security incident.
    """

    permission_classes = [IsAuthenticated]

    queryset = Incident.objects.prefetch_related(
        "alerts",
        "alerts__detection",
    )

    serializer_class = IncidentSerializer