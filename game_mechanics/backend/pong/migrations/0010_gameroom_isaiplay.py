# Generated by Django 5.0.6 on 2024-10-13 13:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0009_remove_ponggame_ball_speed_x_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='gameroom',
            name='isAiPlay',
            field=models.BooleanField(default=False),
        ),
    ]
