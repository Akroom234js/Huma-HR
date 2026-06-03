<?php

namespace App\Providers;

use App\Repositories\Eloquent\EloquentApplicationRepository;
use App\Repositories\Eloquent\EloquentAttachmentRepository;
use App\Repositories\Eloquent\EloquentInterviewRepository;
use App\Repositories\Eloquent\EloquentJobPostingRepository;
use App\Repositories\Eloquent\EloquentOfferRepository;
use App\Repositories\Interfaces\ApplicationRepositoryInterface;
use App\Repositories\Interfaces\AttachmentRepositoryInterface;
use App\Repositories\Interfaces\InterviewRepositoryInterface;
use App\Repositories\Interfaces\JobPostingRepositoryInterface;
use App\Repositories\Interfaces\OfferRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ربط واجهات المستودعات مع تطبيقاتها
        $this->app->bind(JobPostingRepositoryInterface::class, EloquentJobPostingRepository::class);
        $this->app->bind(ApplicationRepositoryInterface::class, EloquentApplicationRepository::class);
        $this->app->bind(InterviewRepositoryInterface::class, EloquentInterviewRepository::class);
        $this->app->bind(OfferRepositoryInterface::class, EloquentOfferRepository::class);
        $this->app->bind(AttachmentRepositoryInterface::class, EloquentAttachmentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production' || env('FORCE_HTTPS', false)) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
