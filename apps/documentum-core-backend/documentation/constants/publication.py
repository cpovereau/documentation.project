# documentation/constants/publication.py

TYPE_SORTIE_CHOICES = [
    ('PDF', 'PDF'),
    ('Web', 'Web Help'),
    ('Moodle', 'Moodle'),
    ('Fiche', 'Fiche Pratique'),
]

TYPE_SORTIE_DICT = dict(TYPE_SORTIE_CHOICES)  # utile pour lookup rapide
TYPE_SORTIE_LABELS = [label for _, label in TYPE_SORTIE_CHOICES]  # utile côté frontend