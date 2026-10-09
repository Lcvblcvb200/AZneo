import "bootstrap/dist/css/bootstrap.min.css";
import "./auth-theme.css";
import "./legal-pages.css";

import logo from "./assets/logo-azneo-full.png";


export default function PrivacyPolicyPage({
  onBack,
}) {
  return (
    <div className="az-legal-page">

      {/* DECORAÇÃO DO FUNDO */}

      <div className="az-circuit circuit-top-left">
        <span />
        <span />
        <span />
      </div>

      <div className="az-circuit circuit-top-right">
        <span />
        <span />
        <span />
      </div>

      <div className="az-circuit circuit-bottom-left">
        <span />
        <span />
        <span />
      </div>

      <div className="az-circuit circuit-bottom-right">
        <span />
        <span />
        <span />
      </div>


      {/* CONTEÚDO */}

      <div className="az-legal-container">

        <div className="az-legal-logo-wrap">

          <img
            src={logo}
            alt="AZNEO"
            className="az-legal-logo"
          />

        </div>


        <div className="az-legal-card">

          <div className="az-legal-header">

            <h1>
              Política de Privacidade
            </h1>

            <p>
              Última atualização:
              30 de agosto de 2026
            </p>

          </div>


          <PolicySection title="1. Introdução">

            <p>
              Esta Política de Privacidade apresenta como a AZNEO
              coleta, utiliza, armazena e protege os dados pessoais
              de seus usuários.
            </p>

          </PolicySection>


          <PolicySection title="2. Dados Coletados">

            <p>
              Poderão ser coletados dados como nome, e-mail, CPF,
              telefone, endereço, dados de autenticação e informações
              relacionadas às compras.
            </p>

            <p>
              Para contas empresariais, poderão ser coletados nome
              e sobrenome do responsável, e-mail corporativo,
              CNPJ e Inscrição Estadual.
            </p>

          </PolicySection>


          <PolicySection title="3. Finalidade dos Dados">

            <p>
              Os dados poderão ser utilizados para cadastro,
              autenticação, realização de pedidos, pagamentos,
              entregas, atendimento, emissão de documentos,
              prevenção de fraudes e segurança da plataforma.
            </p>

          </PolicySection>


          <PolicySection title="4. Senhas e Credenciais">

            <p>
              As senhas devem ser tratadas de forma segura
              e não devem ser armazenadas em texto puro.
            </p>

            <p>
              Poderão ser utilizados mecanismos como hash de senha,
              autenticação por token e controle de acesso.
            </p>

          </PolicySection>


          <PolicySection title="5. Pagamentos">

            <p>
              Informações relacionadas ao pagamento poderão ser
              processadas por instituições financeiras e
              intermediadores especializados.
            </p>

            <p>
              A AZNEO deverá evitar o armazenamento de dados
              sensíveis de cartão, como o código de segurança.
            </p>

          </PolicySection>


          <PolicySection title="6. Compartilhamento de Dados">

            <p>
              Os dados poderão ser compartilhados quando necessário
              com empresas de pagamento, transportadoras,
              fornecedores, serviços de hospedagem, autenticação,
              segurança, emissão fiscal e autoridades competentes.
            </p>

          </PolicySection>


          <PolicySection title="7. Segurança">

            <p>
              Poderão ser adotadas medidas como criptografia de
              comunicação, controle de permissões, validação de
              dados, monitoramento e backups.
            </p>

            <p>
              Nenhum sistema conectado à internet pode garantir
              segurança absoluta.
            </p>

          </PolicySection>


          <PolicySection title="8. Cookies e Dados Técnicos">

            <p>
              A plataforma poderá utilizar cookies e informações
              técnicas necessárias para sessão, preferências,
              segurança e funcionamento.
            </p>

            <p>
              Também poderão ser registrados IP, navegador,
              dispositivo, data, horário e informações técnicas
              de acesso.
            </p>

          </PolicySection>


          <PolicySection title="9. Armazenamento">

            <p>
              Os dados serão mantidos pelo período necessário para
              as finalidades informadas e para cumprimento de
              obrigações legais, fiscais ou de segurança.
            </p>

          </PolicySection>


          <PolicySection title="10. Direitos do Usuário">

            <p>
              O usuário poderá solicitar acesso, correção,
              confirmação de tratamento, exclusão, anonimização,
              bloqueio, portabilidade e demais direitos previstos
              pela LGPD.
            </p>

          </PolicySection>


          <PolicySection title="11. Responsabilidade do Usuário">

            <p>
              O usuário deve fornecer informações verdadeiras
              e atualizadas, proteger sua senha e comunicar
              acessos não autorizados.
            </p>

          </PolicySection>


          <PolicySection title="12. Alterações desta Política">

            <p>
              Esta Política poderá ser atualizada quando houver
              alterações na plataforma, nos serviços utilizados
              ou na legislação.
            </p>

          </PolicySection>


          <PolicySection title="13. Legislação Aplicável">

            <p>
              O tratamento de dados pessoais será realizado conforme
              a legislação brasileira, especialmente a Lei Geral
              de Proteção de Dados Pessoais — Lei nº 13.709/2018.
            </p>

          </PolicySection>


          <PolicySection title="14. Contato">

            <p>
              Solicitações relacionadas à privacidade poderão ser
              encaminhadas pelos canais oficiais disponibilizados
              pela AZNEO.
            </p>

          </PolicySection>


          <div className="az-legal-back-wrap">

            <button
              type="button"
              onClick={onBack}
              className="az-legal-back"
            >
              ← Voltar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


function PolicySection({
  title,
  children,
}) {
  return (
    <section className="az-legal-section">

      <h2>
        {title}
      </h2>

      <div>
        {children}
      </div>

    </section>
  );
}