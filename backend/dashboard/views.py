from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.services.dashboard_stats import get_dashboard_stats


class DashboardStatsView(APIView):
    """
    Return security dashboard statistics.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = get_dashboard_stats()

        return Response(stats)