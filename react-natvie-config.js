module.exports = {
  dependencies: {
    'react-native-sqlite-storage': {
      platforms: {
        android: {
          // 라이브러리의 소스 디렉토리를 지정합니다.
          sourceDir:
            '../node_modules/react-native-sqlite-storage/platforms/android',
          // Android 플랫폼에서 사용할 패키지의 import 경로를 정의합니다.
          packageImportPath: 'import org.pgsqlite.SQLitePluginPackage;',
          // Android 플랫폼에서 패키지 인스턴스를 생성하는 방법을 지정
          packageInstance: 'new SQLitePluginPackage()',
        },
      },
    },
  },
};
