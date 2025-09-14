# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only pom.xml first to leverage Docker cache
COPY pom.xml .

# Copy source files
COPY src ./src

# Build the jar
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
