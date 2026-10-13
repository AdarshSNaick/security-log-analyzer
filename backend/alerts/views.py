from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from alerts.models import Alert
from alerts.serializers import AlertSerializer


class AlertListView(generics.ListAPIView):
    """
    Return all security alerts to authenticated users.
    """

    permission_classes = [IsAuthenticated]

    queryset = Alert.objects.select_related(
        "detection",
        "detection__log_entry",
    ).order_by("-created_at")

    serializer_class = AlertSerializer


class AlertResolveView(APIView):
    """
    Mark an alert as resolved.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        return self.resolve_alert(pk)

    def patch(self, request, pk):
        return self.resolve_alert(pk)

    def resolve_alert(self, pk):
        try:
            alert = Alert.objects.get(pk=pk)
        except Alert.DoesNotExist:
            return Response(
                {"detail": "Alert not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        alert.status = "RESOLVED"
        alert.save(update_fields=["status"])

        return Response(
            AlertSerializer(alert).data,
            status=status.HTTP_200_OK,
        )