# Generated by Django 5.0.6 on 2024-10-01 10:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0003_rename_usermetrics_usermetric'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='nickname',
            new_name='username',
        ),
    ]