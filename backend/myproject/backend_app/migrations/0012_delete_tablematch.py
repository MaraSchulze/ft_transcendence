# Generated by Django 5.0.6 on 2024-10-21 13:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0011_user_is_staff_user_is_superuser'),
    ]

    operations = [
        migrations.DeleteModel(
            name='TableMatch',
        ),
    ]