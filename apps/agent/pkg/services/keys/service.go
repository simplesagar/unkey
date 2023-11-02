package keys

import (
	"context"

	apisv1 "github.com/unkeyed/unkey/apps/agent/gen/proto/apis/v1"
	authenticationv1 "github.com/unkeyed/unkey/apps/agent/gen/proto/authentication/v1"
	"github.com/unkeyed/unkey/apps/agent/pkg/analytics"
	"github.com/unkeyed/unkey/apps/agent/pkg/cache"

	"github.com/unkeyed/unkey/apps/agent/pkg/events"
	"github.com/unkeyed/unkey/apps/agent/pkg/logging"
	"github.com/unkeyed/unkey/apps/agent/pkg/metrics"
	"github.com/unkeyed/unkey/apps/agent/pkg/ratelimit"
	"github.com/unkeyed/unkey/apps/agent/pkg/tracing"
)

type KeyService interface {
	VerifyKey(context.Context, *authenticationv1.VerifyKeyRequest) (*authenticationv1.VerifyKeyResponse, error)
	CreateKey(context.Context, *authenticationv1.CreateKeyRequest) (*authenticationv1.CreateKeyResponse, error)
	SoftDeleteKey(context.Context, *authenticationv1.SoftDeleteKeyRequest) (*authenticationv1.SoftDeleteKeyResponse, error)
	GetKey(context.Context, *authenticationv1.GetKeyRequest) (*authenticationv1.GetKeyResponse, error)
}

type Database interface {
	InsertKey(ctx context.Context, key *authenticationv1.Key) error
	SoftDeleteKey(ctx context.Context, keyId string) error
	FindKeyById(ctx context.Context, keyId string) (*authenticationv1.Key, bool, error)
	FindKeyByHash(ctx context.Context, keyHash string) (*authenticationv1.Key, bool, error)
	FindApiByKeyAuthId(ctx context.Context, keyAuthId string) (*apisv1.Api, bool, error)
	DecrementRemainingKeyUsage(ctx context.Context, keyId string) (*authenticationv1.Key, error)
}

type Config struct {
	Database Database
	Events   events.EventBus
	KeyCache cache.Cache[*authenticationv1.Key]
	ApiCache cache.Cache[*apisv1.Api]

	Logger    logging.Logger
	Tracer    tracing.Tracer
	Metrics   metrics.Metrics
	Analytics analytics.Analytics

	MemoryRatelimit    ratelimit.Ratelimiter
	ConsitentRatelimit ratelimit.Ratelimiter
}

type keyService struct {
	db       Database
	events   events.EventBus
	keyCache cache.Cache[*authenticationv1.Key]
	apiCache cache.Cache[*apisv1.Api]

	logger    logging.Logger
	tracer    tracing.Tracer
	metrics   metrics.Metrics
	analytics analytics.Analytics

	memoryRatelimit    ratelimit.Ratelimiter
	consitentRatelimit ratelimit.Ratelimiter
}

type Middleware func(KeyService) KeyService

func New(config Config, mws ...Middleware) KeyService {

	svc := &keyService{
		db:                 config.Database,
		events:             config.Events,
		keyCache:           config.KeyCache,
		apiCache:           config.ApiCache,
		logger:             config.Logger.With().Str("svc", "keys").Logger(),
		tracer:             config.Tracer,
		metrics:            config.Metrics,
		analytics:          config.Analytics,
		memoryRatelimit:    config.MemoryRatelimit,
		consitentRatelimit: config.ConsitentRatelimit,
	}

	// set noop defaults for optional dependencies
	if svc.events == nil {
		svc.events = events.NewNoop()
	}
	if svc.tracer == nil {
		svc.tracer = tracing.NewNoop()
	}
	if svc.metrics == nil {
		svc.metrics = metrics.NewNoop()
	}
	if svc.analytics == nil {
		svc.analytics = analytics.NewNoop()
	}
	if svc.memoryRatelimit == nil {
		svc.memoryRatelimit = ratelimit.NewInMemory()
	}
	if svc.keyCache == nil {
		svc.keyCache = cache.NewNoopCache[*authenticationv1.Key]()
	}
	if svc.apiCache == nil {
		svc.apiCache = cache.NewNoopCache[*apisv1.Api]()
	}

	// casting the type to the interface
	var s KeyService = svc

	for _, mw := range mws {
		s = mw(s)
	}
	return s
}
