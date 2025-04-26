$UI_ENABLED=$true

foreach ($arg in $args) {
    if ($arg -eq "--no-ui") {
        $UI_ENABLED=$false
    }
    elseif ($arg -eq "--help") {
        Write-Host "Usage : ./dev.ps1 [options]"
        Write-Host "Options :"
        Write-Host "   --no-ui : Disable the UI"
        Write-Host "   --help : Display this help"
        exit 0
    }
}

Write-Host "Starting Quarkus in dev mode ..."
.\mvnw clean compile quarkus:dev "-Ddebug=5007" "-Dquarkus.quinoa=$UI_ENABLED"