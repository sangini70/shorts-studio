# SHORTS_WORKFLOW

Status: Approved  
Version: 1.0  
Last Updated: 2026-08-28

---

# 1. Project

Project Name:

```text
shorts
```

목적:

**이미지 + 성우 음성 + SRT 자막을 입력하면 자동으로 세로형 숏폼 MP4를 생성하는 간단한 로컬 제작 도구를 만든다.**

이 프로젝트의 핵심은 화려한 AI 영상 생성이 아니다.

```text
좋은 대본
+
성우 음성
+
내용에 맞는 이미지
+
간단한 화면 움직임
=
빠르고 저렴한 숏폼 제작
```

---

# 2. V1 Goal

V1은 다음 기능만 구현한다.

```text
이미지 N장
+
음성 WAV / MP3
+
SRT 자막
        ↓
자동 영상 조립
        ↓
1080 × 1920 MP4
```

이미지 개수는 고정하지 않는다.

대본에 따라:

```text
6장
8장
10장
12장
15장
...
```

등 자유롭게 사용할 수 있어야 한다.

---

# 3. Input

사용자가 원페이지에서 다음 파일을 입력한다.

## Images

```text
JPG
JPEG
PNG
WEBP
```

복수 업로드를 지원한다.

이미지 순서는 영상의 장면 순서가 된다.

가능하면 Drag & Drop으로 순서를 변경할 수 있게 한다.

---

## Audio

최소 지원:

```text
WAV
MP3
```

가능하면 다음도 지원한다.

```text
M4A
AAC
```

음성이 영상 전체 길이의 기준이 된다.

예:

```text
narration.wav = 37.4초
→ 최종 영상도 약 37.4초
```

---

## Subtitle

```text
SRT
```

SRT에 기록된 시간 정보를 그대로 사용하여 자막을 영상에 Burn-in 한다.

별도의 음성인식(STT)은 V1에서 구현하지 않는다.

---

# 4. Output

최종 결과:

```text
MP4
1080 × 1920
9:16
```

목표 플랫폼:

```text
YouTube Shorts
Instagram Reels
TikTok
```

---

# 5. Core Processing

기본 처리 흐름:

```text
이미지 업로드
        ↓
오디오 업로드
        ↓
SRT 업로드
        ↓
오디오 길이 확인
        ↓
이미지 개수 확인
        ↓
장면 시간 자동 계산
        ↓
이미지 9:16 화면 맞춤
        ↓
Zoom / Pan 적용
        ↓
장면 전환 적용
        ↓
성우 음성 삽입
        ↓
SRT 자막 Burn-in
        ↓
MP4 렌더링
```

영상 처리 엔진은 기본적으로:

```text
FFmpeg
```

를 사용한다.

---

# 6. Image Motion

정지 이미지가 영상처럼 느껴지도록 각 이미지에 간단한 움직임을 적용한다.

V1 기본 효과:

```text
Slow Zoom In
Slow Zoom Out
Pan Left
Pan Right
Pan Up
Pan Down
```

이미지별 효과는 자동으로 순환 또는 배정한다.

예:

```text
1 → Zoom In
2 → Pan Right
3 → Zoom Out
4 → Pan Left
5 → Zoom In
6 → Pan Up
7 → Zoom Out
8 → Pan Right
```

지나치게 빠르거나 화려한 움직임은 사용하지 않는다.

---

# 7. Scene Duration

V1에서는 우선 단순한 자동 배분을 사용한다.

예:

```text
오디오 길이 = 36초
이미지 = 9장

36 ÷ 9
= 이미지당 약 4초
```

장면 전환 시간은 전체 길이를 크게 변경하지 않도록 처리한다.

향후 필요하면 SRT 구간 또는 사용자가 지정한 장면별 시간과 이미지 노출 시간을 연결할 수 있다.

V1에서는 과도한 자동 분석 기능을 추가하지 않는다.

---

# 8. Transition

이미지 사이에는 간단한 전환을 사용한다.

기본:

```text
Cross Fade
```

약:

```text
0.2 ~ 0.5초
```

범위의 자연스러운 전환을 우선한다.

화려한 Transition Effect는 V1에서 제외한다.

---

# 9. Subtitle

SRT를 영상에 직접 표시한다.

V1 기본 스타일:

```text
화면 하단 중앙
굵고 읽기 쉬운 글자
검은색 Outline 또는 Shadow
최대 2줄 권장
모바일에서 읽기 쉬운 크기
```

한글이 깨지지 않아야 한다.

UTF-8을 기본으로 처리한다.

자막 내용과 SRT 시간 정보는 임의로 변경하지 않는다.

---

# 10. UI

V1은 One Page 구조로 만든다.

예:

```text
┌──────────────────────────────┐
│ SHORTS                       │
│ 이미지로 빠르게 숏폼 만들기 │
├──────────────────────────────┤
│                              │
│ [ 이미지 추가 ]              │
│                              │
│ [01] [02] [03] [04]          │
│ [05] [06] [07] [08]          │
│                              │
│ 이미지 순서 변경             │
│                              │
│ [ 음성 파일 선택 ]           │
│ narration.wav                │
│                              │
│ [ SRT 선택 ]                 │
│ narration.srt                │
│                              │
│       [ 영상 만들기 ]         │
│                              │
│ 진행률 ███████░░             │
│                              │
│ 완료                         │
│ [ MP4 저장 ]                 │
└──────────────────────────────┘
```

V1에서는 복잡한 편집 Timeline을 만들지 않는다.

---

# 11. V1 Non-Goals

다음 기능은 V1에서 구현하지 않는다.

```text
AI 영상 생성
이미지 생성
대본 생성
TTS 생성
STT
자동 SRT 생성
CapCut 연동
복잡한 Timeline Editor
필터 효과
3D Transition
얼굴 Animation
Lip Sync
Cloud Rendering
회원가입
결제
Database
```

필요성이 실제 사용 과정에서 확인된 기능만 후속 버전에 추가한다.

---

# 12. Architecture Principle

가능한 한 단순하게 유지한다.

```text
Browser One Page UI
        ↓
Local Processing
        ↓
FFmpeg
        ↓
MP4
```

영상 생성 때문에 외부 유료 API를 기본 구조에 넣지 않는다.

로컬 PC에서 처리 가능한 것은 로컬에서 처리한다.

---

# 13. Development Rule

Codex는 작업 전에 이 문서를 먼저 읽는다.

작업 원칙:

```text
작은 기능부터 구현한다.
한 번에 한 문제만 수정한다.
불필요한 리팩토링을 하지 않는다.
Fallback / Mock을 임의로 추가하지 않는다.
요청하지 않은 기능을 추가하지 않는다.
```

기존에 정상 동작하는 기능을 변경해야 할 경우 먼저 이유와 영향 범위를 확인한다.

---

# 14. Verification

수정 후 최소 다음을 확인한다.

```text
1. 앱 실행 성공
2. 이미지 여러 장 업로드 성공
3. WAV 입력 성공
4. MP3 입력 성공
5. SRT 입력 성공
6. 이미지 순서 유지
7. 오디오 길이 정상 인식
8. 영상 길이 정상
9. Zoom / Pan 정상
10. 자막 시간 정상
11. 한글 자막 깨짐 없음
12. 1080 × 1920 MP4 생성 성공
13. 최종 영상 재생 성공
```

오류가 발생하면 증상과 원인을 먼저 확인한 후 수정한다.

---

# 15. First Build Order

초기 구현은 다음 순서를 따른다.

```text
STEP 1
프로젝트 기본 실행

STEP 2
One Page UI

STEP 3
이미지 N장 업로드

STEP 4
WAV / MP3 업로드

STEP 5
SRT 업로드

STEP 6
FFmpeg 연결

STEP 7
정지 이미지 → MP4 생성

STEP 8
이미지 N장 자동 연결

STEP 9
Zoom / Pan

STEP 10
Cross Fade

STEP 11
오디오 삽입

STEP 12
SRT Burn-in

STEP 13
1080 × 1920 최종 출력

STEP 14
실제 숏폼 1편 E2E 검증
```

한 단계가 정상 동작한 것을 확인한 뒤 다음 단계로 이동한다.

---

# 16. Success Definition

V1 성공 기준은 단순하다.

사용자가:

```text
이미지 N장
+
성우 WAV 또는 MP3
+
SRT
```

를 준비한 뒤,

```text
[영상 만들기]
```

버튼 한 번으로

```text
9:16
1080 × 1920
30~40초 전후
자막 포함
성우 음성 포함
이미지 Zoom/Pan 포함
```

MP4를 얻을 수 있으면 V1은 성공이다.

---

# 17. Final Principle

이 프로젝트에서 가장 중요한 것은 영상 효과가 아니다.

```text
Content First
```

좋은 대본과 성우의 전달력이 핵심이다.

영상은 내용을 이해하고 지루하지 않게 보조하는 역할만 한다.

따라서:

```text
복잡한 영상 생성보다
빠른 제작

화려한 효과보다
내용 전달

많은 기능보다
반복 사용 가능한 단순한 Workflow
```

를 우선한다.