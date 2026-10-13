from django.urls import path

from reports.views import (
    ReportListView,
    ReportGenerateView,
    ReportDownloadView,
)


urlpatterns = [
    path(
        "",
        ReportListView.as_view(),
        name="report-list",
    ),

    path(
        "generate/",
        ReportGenerateView.as_view(),
        name="report-generate",
    ),

    path(
        "<str:report_id>/download/",
        ReportDownloadView.as_view(),
        name="report-download",
    ),
]