#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

check_200() {
  local path="$1"
  local status
  status="$(curl -fsS -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")"
  if [[ "$status" != "200" ]]; then
    echo "Expected ${path} to return 200, got ${status}" >&2
    exit 1
  fi
  echo "ok ${path}"
}

check_404() {
  local path="$1"
  local status
  status="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")"
  if [[ "$status" != "404" ]]; then
    echo "Expected ${path} to return 404, got ${status}" >&2
    exit 1
  fi
  echo "ok ${path} 404"
}

check_200 "/"
check_200 "/cv/"
check_200 "/research/"
check_200 "/assets/pdf/cv.pdf"
check_200 "/robots.txt"
check_200 "/sitemap.xml"
check_200 "/feed.xml"

check_404 "/publications/"
check_404 "/blog/"
check_404 "/books/"
check_404 "/news/"
check_404 "/people/"
check_404 "/projects/"
check_404 "/repositories/"
check_404 "/teaching/"
check_404 "/assets/html/relativity.html"
check_404 "/assets/jupyter/blog.ipynb.html"
check_404 "/assets/plotly/demo.html"

node tests/static-checks.mjs "${BASE_URL}"
