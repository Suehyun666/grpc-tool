# Ghz를 이용한 grpc test tool

기존 gRPC 테스트 방식은 터미널에서 복잡한 경로와 옵션을 직접 입력하고, 결과 파일을 만들어 대시보드에 업로드해야 하는 번거로운 과정이었습니다. **grpc-tool**은 이 과정을 통합 및 시각화하여 개발 효율성을 극대화합니다.

# UI

<p align="center">
<img width="2556" height="1258" alt="Image" src="https://github.com/user-attachments/assets/c44cffdc-3de4-4fcd-a53f-a7c1ad306eb9" />
</p>

# Download
```bash
git clone https://github.com/Suehyun666/grpc-tool.git
cd grpc-tool
```

# Frontend Build
```bash
cd /web
npm install
npm run build
```

# Backend Run
```bash
cd grpc-tool
go build
go run main.go
```
