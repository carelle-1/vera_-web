<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Candidature</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
    <h1 style="font-size: 20px; font-weight: 800; margin-bottom: 16px; color: #111827;">Nouvelle candidature</h1>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
        <strong>{{ $userName }}</strong> a postulé au poste de <strong>{{ $jobTitle }}</strong>
        @if($company)
        chez <strong>{{ $company }}</strong>.
        @endif
    </p>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
        Vous trouverez en pièce jointe le CV et la lettre de motivation du candidat.
    </p>
    <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
        Ce message a été envoyé automatiquement depuis VERA - Plateforme de recrutement.
    </p>
</body>
</html>
