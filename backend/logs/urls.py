from django.urls import path

from logs.views import (
    LogEntryListView,
    LogFileListView,
    LogFileUploadView,
    LogEntryDeleteView,
)


urlpatterns = [
    path(
        "",
        LogEntryListView.as_view(),
        name="log-list",
    ),

    path(
        "files/",
        LogFileListView.as_view(),
        name="log-file-list",
    ),

    path(
        "upload/",
        LogFileUploadView.as_view(),
        name="log-upload",
    ),

    path(
        "<int:pk>/",
        LogEntryDeleteView.as_view(),
        name="log-delete",
    ),
]