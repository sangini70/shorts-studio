# 공통지시문

먼저 `SYSTEM` 폴더의 다음 문서를 읽고 이번 작업 전체에 적용한다.

1. `AI_WORK_RULES.md`
2. `KNOWLEDGE_PACK.md`
3. 필요 시 관련 `REFERENCE_*.md`

현재 작업 대상은 `PROJECTS/[project_name]`이다.

기본 작업 순서는 다음과 같다.

`대본/Brief 확인`
→ `1_model_image 확인`
→ `Scene 설계`
→ `이미지 프롬프트 작성`
→ `OUTPUT에 .md 저장`
→ `2_flow_image의 실제 생성 이미지 확인`
→ `I2V 프롬프트 작성`
→ `OUTPUT에 .md 저장`

실제 Image Prompt와 I2V Prompt는 자연스럽고 구체적인 영어로 작성한다.

사용자가 제공한 완성 대본은 임의로 수정하지 않는다.

`3_flow_mov`는 영상 결과물 저장 폴더로만 사용한다.

현재 요청 범위 밖의 파일 수정, 구조 변경, 자동화, 리팩터링은 수행하지 않는다.