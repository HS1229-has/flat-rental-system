$JAVA_HOME = "C:\Users\hyyt0\.jdks\openjdk-26.0.2"
$env:JAVA_HOME = $JAVA_HOME
$env:PATH = "$JAVA_HOME\bin;$env:PATH"

$jvmArgs = @(
  "-Dio.netty.tryReflectionSetAccessible=true",
  "--add-opens=java.base/java.nio=ALL-UNNAMED",
  "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED",
  "--add-opens=java.base/java.lang=ALL-UNNAMED",
  "--add-opens=java.base/java.lang.reflect=ALL-UNNAMED",
  "-jar",
  "api-gateway/target/api-gateway.jar"
)

& java $jvmArgs 2>&1
