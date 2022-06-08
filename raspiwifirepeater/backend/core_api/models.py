from django.db import models
from django.utils.timezone import now
# Create your models here.

class Network(models.Model):
    ssid = models.CharField(max_length=90, blank=True, null=True)
    pswd = models.CharField(max_length=100, blank=True, null=True)
    mgmt = models.CharField(max_length=20, blank=True, null=True)
    interface = models.CharField(max_length=20)
    ipaddress = models.CharField(max_length=20, blank=True, null=True, unique=True)
    mac = models.CharField(max_length=20, blank=True, null=True)
    status = models.IntegerField(default=0)
    enabled = models.IntegerField(default=1)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.updated_on = now()
            self.created_at = now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.interface

class Setting(models.Model):
    ipaddress = models.CharField(max_length=20, blank=True, null=True)
    router = models.IntegerField(default=0)
    apoint = models.IntegerField(default=0)
    state = models.IntegerField(default=0)
    wifi = models.IntegerField(default=1)
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.updated_on = now()
            self.created_at = now()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return str(self.wifi)