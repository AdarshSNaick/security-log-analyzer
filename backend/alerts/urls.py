from django.urls import path

from alerts.views import AlertListView, AlertResolveView


urlpatterns = [
    path("", AlertListView.as_view(), name="alert-list"),
    path(
        "<int:pk>/resolve/",
        AlertResolveView.as_view(),
        name="alert-resolve",
    ),
]