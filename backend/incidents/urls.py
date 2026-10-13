from django.urls import path

from incidents.views import IncidentListView, IncidentDetailView


urlpatterns = [
    path("", IncidentListView.as_view(), name="incident-list"),
    path("<int:pk>/", IncidentDetailView.as_view(), name="incident-detail"),
]