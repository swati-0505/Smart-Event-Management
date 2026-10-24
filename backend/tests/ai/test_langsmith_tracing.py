from contextlib import nullcontext
from unittest.mock import patch

from pydantic import SecretStr

from app.observability import langsmith as tracing
from app.rag.converter import ConvertedDocument
from app.rag.ingest import _ingest_trace_inputs


def test_langsmith_trace_is_disabled_by_default(monkeypatch):
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_TRACING', False)

    with patch.object(tracing, '_get_client') as get_client, patch.object(
        tracing, 'tracing_context'
    ) as tracing_context:
        with tracing.langsmith_trace('agent'):
            pass

    get_client.assert_not_called()
    tracing_context.assert_not_called()


def test_langsmith_trace_skips_network_when_api_key_is_missing(monkeypatch, caplog):
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_TRACING', True)
    monkeypatch.setattr(
        tracing.langsmith_settings,
        'LANGSMITH_API_KEY',
        SecretStr('replace_with_a_new_rotated_key'),
    )
    monkeypatch.setattr(tracing, '_missing_key_warning_logged', False)

    with patch.object(tracing, '_get_client') as get_client, patch.object(
        tracing, 'tracing_context'
    ) as tracing_context:
        with tracing.langsmith_trace('agent'):
            pass

    get_client.assert_not_called()
    tracing_context.assert_not_called()
    assert 'traces will not be sent' in caplog.text


def test_langsmith_trace_adds_project_agent_and_pipeline_metadata(monkeypatch):
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_TRACING', True)
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_API_KEY', SecretStr('rotated-key'))
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_ENDPOINT', 'https://smith.example')
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_PROJECT', 'smart-project')
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_AGENT_ID', 'smart')
    monkeypatch.setattr(tracing.langsmith_settings, 'LANGSMITH_AGENT_ENVIRONMENT', 'test')
    monkeypatch.setattr(tracing, '_missing_key_warning_logged', False)

    with patch.object(tracing, '_get_client', return_value=object()) as get_client, patch.object(
        tracing, 'tracing_context', return_value=nullcontext()
    ) as tracing_context:
        with tracing.langsmith_trace('agent'):
            pass

    get_client.assert_called_once_with('rotated-key', 'https://smith.example')
    tracing_context.assert_called_once_with(
        enabled=True,
        client=get_client.return_value,
        project_name='smart-project',
        tags=['agent:smart', 'pipeline:agent'],
        metadata={'agent_id': 'smart', 'environment': 'test', 'pipeline': 'agent'},
    )


def test_ingest_trace_inputs_exclude_document_text_and_database_session():
    document = ConvertedDocument(
        filename='policy.md',
        doc_type='policy',
        title='Policy',
        text='private document content',
        content_hash='content-hash',
    )

    inputs = _ingest_trace_inputs(
        {'db': object(), 'document': document, 'force': True}
    )

    assert inputs == {
        'filename': 'policy.md',
        'doc_type': 'policy',
        'content_hash': 'content-hash',
        'force': True,
    }
    assert 'private document content' not in str(inputs)
