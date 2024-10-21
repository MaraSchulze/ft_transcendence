from django.contrib import admin
from .models import User, TableMatch, UserMetric, GameRoom, PongGame
# Register your models here.

admin.site.register(User)
admin.site.register(TableMatch)
admin.site.register(UserMetric)
admin.site.register(GameRoom)
admin.site.register(PongGame)