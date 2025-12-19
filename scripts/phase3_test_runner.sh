#!/bin/bash
# Phase 3 Automated Testing Script
# Runs comprehensive tests for Phase 3 components

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test results
PASSED=0
FAILED=0
WARNINGS=0

test_file_exists() {
    local file="$1"
    local name="$2"
    if [ -f "$file" ]; then
        print_success "$name exists: $file"
        ((PASSED++))
        return 0
    else
        print_error "$name missing: $file"
        ((FAILED++))
        return 1
    fi
}

test_imports() {
    local file="$1"
    local name="$2"
    if grep -q "import.*from" "$file" 2>/dev/null; then
        print_success "$name has imports"
        ((PASSED++))
    else
        print_warning "$name has no imports (may be incomplete)"
        ((WARNINGS++))
    fi
}

test_component_structure() {
    local file="$1"
    local name="$2"
    local has_export=false
    local has_interface=false
    
    if grep -q "export.*function\|export default" "$file" 2>/dev/null; then
        has_export=true
    fi
    
    if grep -q "interface\|type" "$file" 2>/dev/null; then
        has_interface=true
    fi
    
    if [ "$has_export" = true ] && [ "$has_interface" = true ]; then
        print_success "$name has proper structure (export + types)"
        ((PASSED++))
    else
        print_warning "$name may be missing exports or types"
        ((WARNINGS++))
    fi
}

print_header "Phase 3 Automated Testing - Component Verification"

echo ""
print_info "Testing Phase 3 Components..."
echo ""

# Test 1: LiveRank Component
print_header "1. LiveRank Component"
test_file_exists "frontend/src/components/LiveRank.tsx" "LiveRank"
test_imports "frontend/src/components/LiveRank.tsx" "LiveRank"
test_component_structure "frontend/src/components/LiveRank.tsx" "LiveRank"

# Test 2: AnalyticsDashboard Component
print_header "2. AnalyticsDashboard Component"
test_file_exists "frontend/src/components/AnalyticsDashboard.tsx" "AnalyticsDashboard"
test_imports "frontend/src/components/AnalyticsDashboard.tsx" "AnalyticsDashboard"
test_component_structure "frontend/src/components/AnalyticsDashboard.tsx" "AnalyticsDashboard"

# Test 3: MetricsSummary Component
print_header "3. MetricsSummary Component"
test_file_exists "frontend/src/components/MetricsSummary.tsx" "MetricsSummary"
test_imports "frontend/src/components/MetricsSummary.tsx" "MetricsSummary"
test_component_structure "frontend/src/components/MetricsSummary.tsx" "MetricsSummary"

# Test 4: PointsChart Component
print_header "4. PointsChart Component"
test_file_exists "frontend/src/components/PointsChart.tsx" "PointsChart"
test_imports "frontend/src/components/PointsChart.tsx" "PointsChart"
test_component_structure "frontend/src/components/PointsChart.tsx" "PointsChart"

# Test 5: RankChart Component
print_header "5. RankChart Component"
test_file_exists "frontend/src/components/RankChart.tsx" "RankChart"
test_imports "frontend/src/components/RankChart.tsx" "RankChart"
test_component_structure "frontend/src/components/RankChart.tsx" "RankChart"

# Test 6: FormComparisonChart Component
print_header "6. FormComparisonChart Component"
test_file_exists "frontend/src/components/FormComparisonChart.tsx" "FormComparisonChart"
test_imports "frontend/src/components/FormComparisonChart.tsx" "FormComparisonChart"
test_component_structure "frontend/src/components/FormComparisonChart.tsx" "FormComparisonChart"

# Test 7: ChipUsageTimeline Component
print_header "7. ChipUsageTimeline Component"
test_file_exists "frontend/src/components/ChipUsageTimeline.tsx" "ChipUsageTimeline"
test_imports "frontend/src/components/ChipUsageTimeline.tsx" "ChipUsageTimeline"
test_component_structure "frontend/src/components/ChipUsageTimeline.tsx" "ChipUsageTimeline"

# Test 8: Dashboard Integration
print_header "8. Dashboard Integration"
if grep -q "LiveRank\|AnalyticsDashboard" "frontend/src/app/dashboard/page.tsx" 2>/dev/null; then
    print_success "Components imported in dashboard"
    ((PASSED++))
else
    print_error "Components not imported in dashboard"
    ((FAILED++))
fi

# Test 9: Analytics Tab
if grep -q "activeTab === 'analytics'" "frontend/src/app/dashboard/page.tsx" 2>/dev/null; then
    print_success "Analytics tab exists in dashboard"
    ((PASSED++))
else
    print_error "Analytics tab missing in dashboard"
    ((FAILED++))
fi

# Summary
echo ""
print_header "Test Summary"
echo ""
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    print_success "All component checks passed!"
    echo ""
    print_info "Next steps:"
    echo "  1. Run manual testing: cd frontend && npm run dev"
    echo "  2. Test all acceptance criteria from docs/phase3-tickets.md"
    echo "  3. Test accessibility (WCAG AA)"
    echo "  4. Test responsive design"
    exit 0
else
    print_error "Some checks failed. Review the errors above."
    exit 1
fi


