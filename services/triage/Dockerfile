FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B verify

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /src/target/ticket-triage-0.1.0.jar ./triage.jar
USER nobody
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/app/triage.jar"]
