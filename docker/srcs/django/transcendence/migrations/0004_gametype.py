# Generated by Django 4.2.19 on 2025-02-15 11:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transcendence', '0003_remove_relationship_temp_field_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='GameType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
            ],
        ),
    ]
