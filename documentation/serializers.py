from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Audience,
    Fonctionnalite,
    Gamme,
    InterfaceUtilisateur,
    Map,
    MapRubrique,
    Media,
    Produit,
    ProfilPublication,
    Projet,
    Rubrique,
    Tag,
    TypeRubrique,
    VersionProjet,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class GammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamme
        fields = ["id", "nom", "description", "is_archived"]


class ProduitSerializer(serializers.ModelSerializer):
    gamme_nom = serializers.CharField(source="gamme.nom", read_only=True)

    class Meta:
        model = Produit
        fields = [
            "id",
            "nom",
            "description",
            "abreviation",
            "gamme",
            "gamme_nom",
            "is_archived",
        ]


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ["id", "nom", "projet", "is_master"]

    def create(self, validated_data):
        # Validation ou logique supplémentaire si nécessaire
        return Map.objects.create(**validated_data)


class MapRubriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapRubrique
        fields = ["id", "map", "rubrique", "ordre", "parent"]


class MapRubriqueCreateSerializer(serializers.Serializer):
    rubrique = serializers.PrimaryKeyRelatedField(queryset=Rubrique.objects.all())
    parent = serializers.PrimaryKeyRelatedField(
        queryset=MapRubrique.objects.all(), required=False, allow_null=True
    )

    def validate(self, data):
        map_instance: Map = self.context["map"]

        # Vérifier que la rubrique appartient bien au projet de la map
        if data["rubrique"].projet_id != map_instance.projet_id:
            raise serializers.ValidationError(
                "La rubrique n’appartient pas au projet de cette map."
            )

        # Vérifier que le parent appartient à la même map
        parent = data.get("parent")
        if parent and parent.map_id != map_instance.id:
            raise serializers.ValidationError("Le parent n’appartient pas à cette map.")

        return data


class VersionProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = VersionProjet
        fields = ["id", "version_numero", "date_lancement", "is_active", "is_archived"]


class ProjetSerializer(serializers.ModelSerializer):
    gamme = GammeSerializer(read_only=True)
    gamme_id = serializers.PrimaryKeyRelatedField(
        queryset=Gamme.objects.all(), source="gamme", write_only=True
    )
    maps = MapSerializer(many=True, read_only=True)
    versions = VersionProjetSerializer(many=True, read_only=True)

    class Meta:
        model = Projet
        fields = [
            "id",
            "nom",
            "description",
            "gamme",
            "gamme_id",
            "maps",
            "versions",
            "version_numero",
            "date_creation",
            "date_mise_a_jour",
            "auteur",
        ]
        extra_kwargs = {"auteur": {"read_only": True}}


class FonctionnaliteSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = Fonctionnalite
        fields = [
            "id",
            "produit",
            "produit_nom",
            "nom",
            "id_fonctionnalite",
            "code",
            "is_archived",
        ]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "nom", "is_archived"]


class ProfilPublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilPublication
        fields = ["id", "nom", "type_sortie", "parametres", "map", "is_archived"]


class InterfaceUtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterfaceUtilisateur
        fields = ["id", "nom", "code", "is_archived"]


class AudienceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audience
        fields = ["id", "nom", "description", "is_archived"]


class AudienceSerializer(serializers.ModelSerializer):
    fonctionnalites = FonctionnaliteSerializer(many=True, read_only=True)
    fonctionnalite_ids = serializers.PrimaryKeyRelatedField(
        queryset=Fonctionnalite.objects.all(),
        source="fonctionnalites",
        write_only=True,
        many=True,
    )

    class Meta:
        model = Audience
        fields = [
            "id",
            "nom",
            "description",
            "fonctionnalites",
            "fonctionnalite_ids",
            "is_archived",
        ]


class RubriqueMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrique
        fields = [
            "id",
            "titre",
            "revision_numero",
            "is_active",
            "is_archived",
        ]


class MapRubriqueStructureSerializer(serializers.ModelSerializer):
    rubrique = RubriqueMiniSerializer(read_only=True)

    class Meta:
        model = MapRubrique
        fields = [
            "id",
            "ordre",
            "parent",
            "rubrique",
        ]


class MapMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ["id", "nom", "is_master"]


class ProjetMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = ["id", "nom"]


class RubriqueSerializer(serializers.ModelSerializer):
    fonctionnalite = FonctionnaliteSerializer(read_only=True)
    fonctionnalite_id = serializers.PrimaryKeyRelatedField(
        queryset=Fonctionnalite.objects.all(),
        source="fonctionnalite",
        write_only=True,
        allow_null=True,
        required=False,
    )
    type_rubrique = serializers.PrimaryKeyRelatedField(
        queryset=TypeRubrique.objects.all(),
        allow_null=True,
        required=False,
    )
    locked_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Rubrique
        fields = [
            "id",
            "titre",
            "contenu_xml",
            "projet",
            "type_rubrique",
            "fonctionnalite",
            "fonctionnalite_id",
            "version_projet",
            "is_active",
            "is_archived",
            "date_creation",
            "date_mise_a_jour",
            "locked_by",
            "locked_at",
            "revision_numero",
            "audience",
            "version",
            "version_precedente",
        ]
        read_only_fields = (
            "version",
            "version_precedente",
            "revision_numero",
            "version_projet",
            "date_creation",
            "date_mise_a_jour",
            "locked_by",
            "locked_at",
        )

    def validate(self, data):
        projet = data.get("projet")
        version_projet = data.get("version_projet")

        if version_projet and version_projet.projet != projet:
            raise serializers.ValidationError(
                "La version associée ne correspond pas au projet sélectionné."
            )

        return data


class CreateRubriqueInMapSerializer(serializers.Serializer):
    titre = serializers.CharField()
    contenu_xml = serializers.CharField()

    type_dita = serializers.ChoiceField(
        choices=["topic", "concept", "task", "reference"],
        required=False,
        default="topic",
    )

    parent = serializers.IntegerField(required=False, allow_null=True)
    insert_after = serializers.IntegerField(required=False, allow_null=True)
    insert_before = serializers.IntegerField(required=False, allow_null=True)


class MapStructureReorderSerializer(serializers.Serializer):
    parentId = serializers.IntegerField(required=False, allow_null=True)
    orderedIds = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )


class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = "__all__"


class MapStructureAttachSerializer(serializers.Serializer):
    """Payload pour POST /api/maps/{id}/structure/attach/"""
    rubrique_id = serializers.IntegerField()
    parent_id = serializers.IntegerField(required=False, allow_null=True)
    ordre = serializers.IntegerField(required=False, allow_null=True)
