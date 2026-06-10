@echo off
echo Creation de la structure posts...

:: Dossier principal
mkdir posts

:: Fichiers TSX
type nul > posts\PostCard.tsx
type nul > posts\PostCardHeader.tsx
type nul > posts\PostContent.tsx
type nul > posts\PostActionsBar.tsx
type nul > posts\DeleteModal.tsx
type nul > posts\EditModal.tsx
type nul > posts\VideoPlayer.tsx
type nul > posts\MediaGrid.tsx
type nul > posts\MediaViewerModal.tsx

echo.
echo Structure creee avec succes !
echo.
pause