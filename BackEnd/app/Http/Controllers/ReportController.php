<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportFilterRequest;
use App\Services\ReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function payrollReport(ReportFilterRequest $request): JsonResponse
    {
        [$month, $year] = $request->period();
        return $this->successResponse(
            $this->reportService->payrollReport($month, $year),
            'Payroll report retrieved successfully.'
        );
    }

    public function leavesReport(ReportFilterRequest $request): JsonResponse
    {
        [$month, $year] = $request->period();
        return $this->successResponse(
            $this->reportService->leavesReport($month, $year),
            'Leaves report retrieved successfully.'
        );
    }

    public function attendanceReport(ReportFilterRequest $request): JsonResponse
    {
        [$month, $year] = $request->period();
        return $this->successResponse(
            $this->reportService->attendanceReport($month, $year),
            'Attendance report retrieved successfully.'
        );
    }

    public function employeesReport(ReportFilterRequest $request): JsonResponse
    {
        [$month, $year] = $request->period();
        return $this->successResponse(
            $this->reportService->employeesReport($month, $year),
            'Employees report retrieved successfully.'
        );
    }
}
