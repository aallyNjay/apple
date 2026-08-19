plugins {
    java
    id("org.springframework.boot") version "3.5.4"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.anj"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // Altibase Hibernate dialect (Hibernate 6.4+ community module)
    implementation("org.hibernate.orm:hibernate-community-dialects")

    // Altibase JDBC 드라이버 — Maven Central에 없으므로 로컬 jar로 추가.
    // 설치본의 $ALTIBASE_HOME/lib/Altibase.jar 를 libs/ 에 복사해 둘 것.
    runtimeOnly(fileTree("libs") { include("*.jar") })

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
