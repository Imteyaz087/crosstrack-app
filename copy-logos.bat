@echo off
REM Copy TrackVolt logo files to public directory
REM Run this script from the TrackVolt-App directory

echo Copying TrackVolt logo files...

REM Create public directory if it doesn't exist
if not exist "public" mkdir public

REM Copy the icon files from the TrackVolt Logo folder
copy /Y "TrackVolt Logo\06-App-Icons\AppIcon-192x192.png" "public\icon-192.png"
if errorlevel 1 (
    echo Warning: Could not copy icon-192.png
) else (
    echo Successfully copied icon-192.png
)

copy /Y "TrackVolt Logo\06-App-Icons\AppIcon-512x512.png" "public\icon-512.png"
if errorlevel 1 (
    echo Warning: Could not copy icon-512.png
) else (
    echo Successfully copied icon-512.png
)

copy /Y "TrackVolt Logo\06-App-Icons\AppIcon-180x180.png" "public\apple-touch-icon.png"
if errorlevel 1 (
    echo Warning: Could not copy apple-touch-icon.png
) else (
    echo Successfully copied apple-touch-icon.png
)

REM For favicon, check if one exists in the logo folder
if exist "TrackVolt Logo\06-App-Icons\favicon.ico" (
    copy /Y "TrackVolt Logo\06-App-Icons\favicon.ico" "public\favicon.ico"
    if errorlevel 1 (
        echo Warning: Could not copy favicon.ico
    ) else (
        echo Successfully copied favicon.ico
    )
) else (
    echo Note: favicon.ico not found in logo folder - you may need to generate it separately
)

echo.
echo Logo file sync complete!
pause