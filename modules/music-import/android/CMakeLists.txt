cmake_minimum_required(VERSION 3.22)
project(rythm_webp LANGUAGES C CXX)

# The FFmpeg 0.18.1 payload includes WebP libraries aligned to 4 KB.
include(FetchContent)
set(BUILD_SHARED_LIBS ON CACHE BOOL "" FORCE)
foreach(tool ANIM_UTILS CWEBP DWEBP GIF2WEBP IMG2WEBP VWEBP WEBPINFO WEBPMUX EXTRAS)
  set(WEBP_BUILD_${tool} OFF CACHE BOOL "" FORCE)
endforeach()
add_link_options("-Wl,-z,max-page-size=16384")
FetchContent_Declare(libwebp
  URL https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.6.0.tar.gz
  URL_HASH SHA256=e4ab7009bf0629fd11982d4c2aa83964cf244cffba7347ecd39019a9e38c4564)
FetchContent_MakeAvailable(libwebp)
